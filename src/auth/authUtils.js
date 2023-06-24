
export async function emailIsNew(email) {
    return await fetch('http://localhost:3000/auth/emailIsNew', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email: email})
    })
        .then(res => res.json())
        .then(data => data.isNew)
        .catch(err => {console.log(err); return true});
}
