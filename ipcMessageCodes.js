module.exports = {
	//messages raised by worker and master
	NEW_MESSAGE_FOR_LOG: 'NML',

	// messages raised by the processor
	NEW_MESSAGE_IN_QUEUE: 'NMQ',
	NEW_MESSAGE_FOR_THREAD: 'NMT',

	// messages raised by the threads
	PROCESSED_MESSAGE_SUCCESSFULLY: 'PMS',
	REQUEST_FOR_MESSAGE: 'RFM',
	EXECUTION_COMPLETED: 'ECS',
	TERMINATE_THREAD: 'TER'
};