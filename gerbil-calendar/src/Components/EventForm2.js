import React, { useState, Component } from 'react';
import { Row, Col, Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import { Modal, ModalHeader, ModalBody, ModalFooter, Toast, ToastHeader, ToastBody } from 'reactstrap';
// import moment from 'moment';
// import { AvForm, AvField } from 'availity-reactstrap-validation';

import firebase from 'firebase/app';
import { render } from 'react-dom';

export class CreateEvent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            newEvent: {}
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState(prevState => ({
            modal: !prevState.modal,
        }));
    }

    cancelEventCreation = () => {
        this.setState({ modal: false, newEvent: {} });
    }

    addTitle = (evt) => {
        this.setState({
            newEvent: {
                ...this.state.newEvent,
                title: evt.target.value
            }
        })
    }

    addDate = (evt) => {
        this.setState({
            newEvent: {
                ...this.state.newEvent,
                date: evt.target.value
            }
        })
    }

    addStartTime = (evt) => {
        this.setState({
            newEvent: {
                ...this.state.newEvent,
                start: evt.target.value
            }
        })
    }

    addEndTime = (evt) => {
        this.setState({
            newEvent: {
                ...this.state.newEvent,
                end: evt.target.value
            }
        })
    }

    addDescription = (evt) => {
        this.setState({
            newEvent: {
                ...this.state.newEvent,
                description: evt.target.value
            }
        })
    }

    addNewEvent = () => {
        this.setState({
            newEvent: {
                ...this.state.newEvent,
                date: this.state.newEvent.date,
                title: this.state.newEvent.title,
                start: this.state.newEvent.date + "T" + this.state.newEvent.start + ":00",
                end: this.state.newEvent.date + "T" + this.state.newEvent.end + ":00",
                description: this.state.newEvent.description ? this.state.newEvent.description : ""
            }
        }, () => {
            let newEventKey = firebase.database().ref('users/' + this.props.user.uid).child('events').push().key;
            let updates = {};

            // push newly created event to firebase
            updates['/users/' + this.props.user.uid + '/events/' + newEventKey] = this.state.newEvent;
           
            // update gift gallery
            let updatedGiftGallery = this.findEventGift();
            let ifGiftObtained = false;
            if (updatedGiftGallery.modal) {
                ifGiftObtained = true;
            }

            updates['/users/' + this.props.user.uid + '/giftGallery/event'] = updatedGiftGallery.user.event;
            updates['/users/' + this.props.user.uid + '/giftGallery/giftGallery'] = updatedGiftGallery.user.giftGallery;
            firebase.database().ref().update(updates);
            
            this.setState({
                modal: false, newEvent: {}
            }, () => {
                if (updatedGiftGallery.modal) {
                    this.props.showGiftModal(updatedGiftGallery.giftObtained);
                }
            });
        });
    }

    // when checkEndTime is true (aka when end time is set BEFORE start time)
    // button will be disabled until user puts in a correct time
    checkEndTime = () => {
        var startDate = new Date(this.state.newEvent.date + "T" + this.state.newEvent.start + ":00"); // ISO8601 format. example: 2018-06-01T12:30:00
        var endDate = new Date(this.state.newEvent.date + "T" + this.state.newEvent.end + ":00"); // ISO8601 format

        var startMS = startDate.getTime(); // convert start ISO8601 string to milliseconds
        var endMS = endDate.getTime(); // convert end ISO8601 string to milliseconds
        var result = startMS - endMS;

        console.log(result);

        if (startMS - endMS >= 0) {
            return true;
        }
    }

    findEventGift = () => {
        console.log(this.props.userData);
        let gifts = this.props.userData.giftGallery.giftGallery;
        let numOfEvents = this.props.userData.giftGallery.event + 1;
        let ifGiftObtained = false;
        let giftObtained = {};
        gifts = gifts.map((gift) => {
            // if gift is already earned, do nothing
            if (gift.earned) {
                return gift;
            }

            // if gift's requirement is not event-related, do nothing
            if (gift.req !== "event") {
                return gift;
            }

            // if gift's requirement num is not reached, do nothing
            if (numOfEvents < gift.reqNum) {
                return gift;
            }

            gift.earned = true;
            ifGiftObtained = true;
            giftObtained = gift;
            return gift;
        });
    

        let returned = {
            "modal": ifGiftObtained,
            "giftObtained": giftObtained,
            "user": {
                "event": numOfEvents,
                "giftGallery": gifts
            }
        }

        return returned;
    }

    render() {
        let endTime = this.checkEndTime();
        return (
            <div>
                <Button color="danger" onClick={this.toggle}>+ Add a Schedule</Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}>Tell me more about the Event!</ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormGroup>
                                <Label for="eventName">What would you like to call this event?</Label>
                                <Input
                                    type="textarea"
                                    name="text"
                                    id="eventName"
                                    onChange={this.addTitle}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="date">When is the event?</Label>
                                <Input
                                    type="date"
                                    name="date"
                                    id="date"
                                    placeholder="date placeholder"
                                    onChange={this.addDate}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="startTime">Start Time</Label>
                                <Input
                                    type="time"
                                    name="time"
                                    id="startTime"
                                    placeholder="time placeholder"
                                    onChange={this.addStartTime}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="endTime">End Time</Label>
                                <Input
                                    type="time"
                                    name="time"
                                    id="endTime"
                                    placeholder="time placeholder"
                                    onChange={this.addEndTime}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="description">What is the Event About? (Optional)</Label>
                                <Input
                                    type="textarea"
                                    name="text"
                                    id="description"
                                    onChange={this.addDescription}
                                />
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="secondary"
                            onClick={this.cancelEventCreation}>
                            Cancel
                        </Button>
                        <Button 
                            color="primary" 
                            onClick={this.addNewEvent}
                            disabled={ endTime || !this.state.newEvent.title || !this.state.newEvent.date || !this.state.newEvent.start || !this.state.newEvent.end }>
                                Add to schedule
                        </Button>{' '}
                        
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export class CreateTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            newTask: {}
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState(prevState => ({
            modal: !prevState.modal,
        }));
    }

    cancelCreateTask = () => {
        this.setState({ modal: false, newEvent: {} });
    }

    addTaskDesc = (evt) => {
        this.setState({
            newTask: {
                ...this.state.newTask,
                task: evt.target.value
            }
        })
    }

    addTaskDate = (evt) => {
        this.setState({
            newTask: {
                ...this.state.newTask,
                date: evt.target.value
            }
        })
    }

    addNewTask = () => {
        this.setState({
            newTask: {
                ...this.state.newTask,

                task: this.state.newTask.task,
                date: this.state.newTask.date ? this.state.newTask.date : ""
            }
        },
            () => {
                let newTaskKey = firebase.database().ref('users/' + this.props.user.uid).child('tasks').push().key;
                let updates = {};

                // push newly created event to firebase
                updates['/users/' + this.props.user.uid + '/tasks/' + newTaskKey] = this.state.newTask;

                // update gift gallery
                let updatedGiftGallery = this.findTaskGift();
                let ifGiftObtained = false;
                if (updatedGiftGallery.modal) {
                    ifGiftObtained = true;
                }
                
                updates['/users/' + this.props.user.uid + '/giftGallery/task'] = updatedGiftGallery.user.task;
                updates['/users/' + this.props.user.uid + '/giftGallery/giftGallery'] = updatedGiftGallery.user.giftGallery;

                firebase.database().ref().update(updates);
                this.setState({ 
                    modal: false, newTask: {} 
                },  () => {
                    if (updatedGiftGallery.modal) {
                        this.props.showGiftModal(updatedGiftGallery.giftObtained);
                    }
                });
            }
        )
    }

    findTaskGift = () => {
        let gifts = this.props.userData.giftGallery.giftGallery;
        let numOfTasks = this.props.userData.giftGallery.task + 1;
        let ifGiftObtained = false;
        let giftObtained = {};
        gifts = gifts.map((gift) => {
            // if gift is already earned, do nothing
            if (gift.earned) {
                return gift;
            }

            // if gift's requirement is not event-related, do nothing
            if (gift.req !== "task") {
                return gift;
            }

            // if gift's requirement num is not reached, do nothing
            if (numOfTasks < gift.reqNum) {
                return gift;
            }

            gift.earned = true;
            ifGiftObtained = true;
            giftObtained = gift;
            return gift;
        });
    

        let returned = {
            "modal": ifGiftObtained,
            "giftObtained": giftObtained,
            "user": {
                "task": numOfTasks,
                "giftGallery": gifts
            }
        }

        return returned;
    }

    render() {
        return (
            <div>
                <Button color="danger" onClick={this.toggle}>Add a Task</Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}>Add a task</ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormGroup>
                                <Label for="exampleText">What is coming up next week?</Label>
                                <Input
                                    type="textarea"
                                    name="text"
                                    id="exampleText"
                                    onChange={this.addTaskDesc}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="exampleDate">When is this due (MM/DD/YY)? Optional.</Label>
                                <Input
                                    type="date"
                                    name="date"
                                    id="exampleDate"
                                    placeholder="date placeholder"
                                    onChange={this.addTaskDate}
                                />
                            </FormGroup>
                        </Form >
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            className="action-button"
                            color="secondary"
                            onClick={this.cancelCreateTask}>
                            Cancel
                        </Button>
                        <Button
                            className="action-button"
                            color="primary"
                            onClick={this.addNewTask}
                            disabled={!this.state.newTask.task}>
                            Add Task
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export class ShowTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            newTask: []
        };
    }

    componentDidMount() {
        window.scrollTo(0, 0);
    }


    render() {
        console.log();


        let renderedTask = this.props.userData.tasks;
        renderedTask = renderedTask.map((task) => {
            let text = "";
            if (!task.date) {
                text = task.task;
            } else {
                text = "DUE " + task.date + " ：" + task.task;
            }
            return <li>{text}</li>;
        })
        return (
            <div id="task-list">
                <ul>
                    {renderedTask}
                </ul>
            </div>
        );
    }
} 