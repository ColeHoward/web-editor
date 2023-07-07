import os
import tarfile
import uuid
from typing import List


class ProjectManager:
    def __init__(self, s3_client, dynamo_db, docker_client, table_name, s3_bucket_name, home_dir):
        self.s3_client = s3_client
        self.dynamo_db = dynamo_db
        self.docker_client = docker_client
        self.table_name = table_name
        self.s3_bucket_name = s3_bucket_name
        self.home_dir = home_dir


    def get_project_files(self, user_id: str, project_name: str) -> dict:
        proj_metadata = self.get_project_metadata(user_id, project_name)
        if not proj_metadata:
            return {}

        files = self.build_project(proj_metadata)
        return files


    def get_project_metadata(self, user_id: str, project_name: str) -> List[dict]:
        response = self.dynamo_db.query(
            TableName=self.table_name,
            KeyConditionExpression='PK = :pk AND begins_with(SK, :sk_prefix)',
            ExpressionAttributeValues={
                ':pk': {'S': f'user#{user_id}'},
                ':sk_prefix': {'S': f'project#{project_name}_file#'},
            },
        )
        if 'Items' in response:
            return response['Items']
        else:
            return []


    def build_project(self, dynamo_data: dict) -> dict:
        if not dynamo_data:
            print('Invalid files data:')
            return {}

        fileMetaData = {}

        for file in dynamo_data:
            filePath = file['SK']["S"].split('#')[2]

            fileMetaData[filePath] = {'fileLink': file["fileLink"]["S"],
                                         'language': file["language"]["S"],
                                         's3_key': file["s3_key"]["S"]}

            s3_response_object = self.s3_client.get_object(Bucket=self.s3_bucket_name, Key=file['s3_key']["S"])
            object_content = s3_response_object['Body'].read()

            object_content = object_content.decode('utf-8')

            fileMetaData[filePath]['content'] = object_content

        return fileMetaData


    def save_file(self, user_id: str, project_name: str, container_id: str, file_path: str, file_content='',
                  language='python') -> dict:
        """
        upload a single file to s3 and store metadata in dynamodb
        """
        s3_key = f'{user_id}/{project_name}/{file_path}'
        try:
            s3_response = self.s3_client.put_object(Bucket=self.s3_bucket_name, Key=s3_key, Body=file_content)
        except Exception as e:
            raise(f'Error uploading to S3: {e}')

        # Store the metadata in DynamoDB
        item = {
            'PK': {'S': f'user#{user_id}'},
            'SK': {'S': f'project#{project_name}_file#{file_path}'},
            'fileLink': {'S': s3_response.get('location', '')},
            's3_key': {'S': s3_key},
            'language': {'S': language},
            'container_id': {'S': container_id},
        }

        try:
            dynamo_response = self.dynamo_db.put_item(
                TableName=self.table_name,
                Item=item
            )
        except Exception as e:
             raise(f'Error updating DynamoDB: {e}')

        return {'s3Upload': s3_response, 'dynamoResponse': dynamo_response}