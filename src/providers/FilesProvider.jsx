import React, {useState, useEffect, useCallback} from "react";

export const FilesContext = React.createContext();

export const FilesProvider = ({ children, projectFiles }) => {
    const [files, setFiles] = useState(projectFiles);  // Initialize your files state here.
    const [currFile, setCurrFile] = useState(null);  // Initialize your files state here.
    useEffect(() => {
        setFiles(projectFiles);
    }, [projectFiles]);

    const getFileContent = useCallback(async (s3_key) => {
        const response = await fetch('http://localhost:3002/get-file/?s3_key=' + encodeURIComponent(s3_key));
        return response.text();
    }, []);

    const openFile = useCallback((fileName) => {
        setFiles((prevFiles) => {
            // If the file is already opened before, just set isOpen to true
            if (fileName in prevFiles && 'content' in prevFiles[fileName]) {
                if (prevFiles[fileName].isOpen === true) {
                    return prevFiles;
                }
                // Note: never update state directly (can lead to weird bugs), always return a new object
                return {
                    ...prevFiles,
                    [fileName]: {
                        ...prevFiles[fileName],
                        isOpen: true,
                    }
                }
            } else {
                // If the file content hasn't been loaded before, get it now
                // Note: This is an async operation, but we can't wait for it (state updates are synchronous)
                getFileContent(prevFiles[fileName].s3_key).then((content) => {
                    setFiles({
                        ...prevFiles,
                        [fileName]: {
                            ...prevFiles[fileName],
                            content: content,
                            isOpen: true,
                        },
                    });
                });
                // Return previous state immediately
                return prevFiles;
            }
        });
    }, [getFileContent]);

    const value = {
        files,
        setFiles,
        openFile,
        currFile,
        setCurrFile
    };

    return (
        <FilesContext.Provider value={value}>
            {children}
        </FilesContext.Provider>
    );
};
