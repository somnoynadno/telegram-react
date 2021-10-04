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

    GetAssignmentsTG(fromID) {
        return new Promise((resolve, reject) => {
            axios.get(apiAddress + `/get_assigments_tg?from_id=${fromID}`)
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        })
    }

    GetTransitions(issueID) {
        return new Promise((resolve, reject) => {
            axios.get(apiAddress + `/get_transitions?issue=${issueID}`)
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        })
    }

    SetTransition(issueID, transitionID) {
        return new Promise((resolve, reject) => {
            axios.post(apiAddress + `/set_transitions`, {
                "issue_id": issueID,
                "trans_id": transitionID
            })
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        })
    }
}

export const api = new API();
