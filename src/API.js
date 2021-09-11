import axios from 'axios'

const apiAddress = process.env.REACT_APP_API_ADDRESS;

class API {
    AddNewTask(text="", author_id=0, to_id=0) {
        return new Promise((resolve, reject) => {
            axios.post(apiAddress + "/create_assigment", {
                    "text": text,
                    "author_id": author_id,
                    "datetime_received": Math.round(Date.now() / 1000),
                    "to_id": to_id
                })
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        })
    }
}

export const api = new API();
