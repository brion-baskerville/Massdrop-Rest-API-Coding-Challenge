///
// SERVER.JS
// Main file that starts the application.
// Lists the needed dependencies, sets the port, connects to the database, and starts the app.
///

//Dependencies
const 	cluster = require('cluster'),
		fork 	= require('child_process').fork;

//Cluster - Master Process
if(cluster.isMaster) {
	//Start Workers
	fork('./worker/worker');

	//System CPU core count
	const cpuCount = require('os').cpus().length;

	//Worker for each CPU core
	for(let i = 0; i < cpuCount; i += 1) {
		cluster.fork();
	}

	//Create another worker if a worker dies
	cluster.on('exit', (worker) => {
		console.log(`Server Worker ${worker.id} died.`);
		cluster.fork();
	});

//Cluster - Worker Process
} else {
	//Dependencies
	const 	express 		= require('express'), //Framework: Express
			mongoConnect	= require('./db/mongoConnect'), //Database: MongoDB. NoSQL Database.
			bodyParser 		= require('body-parser'); //Parser: Body Parser. Parse data sent to the DB.
	
	const app = express();

	//Port to listen on
	const port = 8000;

	//Parse data
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

	mongoConnect.connect( (error) => {
		if(error) return console.log(error);
		
		require('./router/routes.js')(app);

		//Tell the app to listen on the specified port
		app.listen(port, () => {
			console.log(`Server Worker ${cluster.worker.id} is listening on ${port}`);
		});
	});
}