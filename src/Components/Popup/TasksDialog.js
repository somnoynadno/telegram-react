/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import Alert from '@material-ui/lab/Alert';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ChatTile from '../Tile/ChatTile';
import {getChatShortTitle} from '../../Utils/Chat';
import {modalManager} from '../../Utils/Modal';
import { makeStyles } from '@material-ui/core/styles';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import {api} from "../../API";
import transitions from "@material-ui/core/styles/transitions";


const TasksDialog = (props) => {
    const [chatId, setChatId] = useState(props.chatId);
    const [isOpen, setIsOpen] = useState(false);

    const [tasks, setTasks] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const classes = useStyles();

    const [alertSuccess, setAlertSuccess] = React.useState(false);
    const [alertError, setAlertError] = React.useState(false);
    const [errorText, setErrorText] = React.useState("");

    useEffect(() => {
        getTasks();
    }, []);

    useEffect(() => {
        setChatId(props.chatId);
        setTasks([]);
        setErrorText("");
        setLoaded(false);

        getTasks();
    }, [props.chatId]);

    useEffect(() => {
        setIsOpen(props.isOpen);
        if (props.isOpen) getTasks();
    }, [props.isOpen]);

    const getTasks = () => {
        api.GetAssignmentsTG(chatId).then(async (res) => {
            let issues = [...res["result"]["issues"]];

            for (let i = 0; i < issues.length; i++) {
                let t = issues[i];
                try {
                    let r = await api.GetTransitions(t["key"]);
                    let transitions = r["result"]["transitions"];
                    console.log(transitions);
                    issues[i]['transitions'] = transitions;
                } catch (e) {
                    console.log(e);
                    issues[i]['transitions'] = [];
                }
            }

            setTasks(issues);
            setLoaded(true);
        }).catch((err) => {
            console.log(err);
            setErrorText("Произошла ошибка при загрузке задач");
            setLoaded(true);
        });
    }

    return (
        <Dialog
            manager={modalManager}
            open={isOpen}
            transitionDuration={0}
            onClose={() => {
                props.onClose();
                setIsOpen(false);
            }}
            maxWidth={"md"}
            aria-labelledby='delete-dialog-title'>
            <DialogTitle id='delete-dialog-title'>Активные задачи</DialogTitle>
            <DialogContent>
                <div className='delete-dialog-content'>
                    <ChatTile chatId={chatId}/>
                    <div>
                        <DialogContentText id='delete-dialog-description'>
                            {errorText ? errorText : (loaded && !tasks) ? "Нет доступных задач" : "Список задач"}
                        </DialogContentText>
                        {!loaded && <LinearProgress style={{margin: 20}} />}
                        <List className={classes.root}>
                            {tasks.map((t, i) => {
                                return <div key={i}>
                                    <ListItem alignItems="flex-start">
                                        {/*<ListItemAvatar>*/}
                                        {/*    <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg"/>*/}
                                        {/*</ListItemAvatar>*/}
                                        {t["transitions"].length > 0 && <ListItemSecondaryAction>
                                            <Select
                                                style={{marginLeft: 30}}
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                label="Статус задачи"
                                                onChange={(event) => {
                                                    setAlertSuccess(false);
                                                    setAlertError(false);

                                                    api.SetTransition(t["key"], event.target.value)
                                                        .then(() => {
                                                            setAlertSuccess(true);
                                                            setTimeout(() => setAlertSuccess(false), 3000);
                                                        })
                                                        .catch((err) => {
                                                            setAlertError(true);
                                                            setTimeout(() => setAlertError(false), 3000);
                                                        })
                                                }}
                                            >
                                                {t["transitions"].map((item, j) => {
                                                    return <MenuItem key={j} value={item["id"]}>
                                                        {item["name"]}
                                                    </MenuItem>
                                                })}
                                            </Select>
                                        </ListItemSecondaryAction>}
                                        <ListItemText
                                            primary={t["fields"]["summary"]}
                                            secondary={
                                                <React.Fragment>
                                                    <Typography
                                                        sx={{display: 'inline'}}
                                                        component="span"
                                                        variant="body2"
                                                        color="text.primary"
                                                    >
                                                        [{t["fields"]["project"]["name"]}]&nbsp;
                                                    </Typography>
                                                    <span>
                                                    {/*<span style={{color: t["fields"]["status"]["statusCategory"]["colorName"] }}>*/}
                                                        {t["fields"]["status"]["name"]}
                                                    </span>
                                                </React.Fragment>
                                            }
                                        />
                                    </ListItem>
                                    <Divider variant="inset" component="li"/>
                                </div>
                            })}
                        </List>
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    props.onClose();
                    setIsOpen(false);
                }} color='primary'>
                    Закрыть
                </Button>
            </DialogActions>
            <Snackbar open={alertSuccess} autoHideDuration={3000}>
                <Alert severity="success">
                    Статус успешно изменен
                </Alert>
            </Snackbar>
            <Snackbar open={alertError} autoHideDuration={3000}>
                <Alert severity="error">
                    Произошла ошибка при смене статуса
                </Alert>
            </Snackbar>
        </Dialog>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        width: '100%',
        minWidth: 640,
        backgroundColor: theme.palette.background.paper,
    },
}));

TasksDialog.propTypes = {
    chatId: PropTypes.number,
    onClose: PropTypes.func,
    isOpen: PropTypes.bool
};

export default withTranslation()(TasksDialog);
