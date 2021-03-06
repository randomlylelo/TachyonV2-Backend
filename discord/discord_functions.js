const express = require('express');
const app = express();
const connectDb = () => {
	return mongoose.connect(process.env.DB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	});
};
const Student = require('../models/student');

const deleteTeam = require('./functions/deleteTeam');
const createTeam = require('./functions/createTeam');
const addMember = require('./functions/addMember');
const removeMember = require('./functions/removeMember');
const convertNameToID = require('./functions/convertNameToID');
const getAllUsers = require('./functions/getAllUsers');
const { updateOne } = require('../models/student');

require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/createTeam', async (req, res) => {
    const { teamName, memberList } = req.body;

	console.log(teamName, memberList);

	if (!teamName || !memberList) {
		return res.send({ success: false, message: `Missing Parameters\nTeam Name: ${teamName}\nMember List ${memberList}` });
	}

	const result = await createTeam(teamName, memberList);

	if (result.success) {
		memberList.forEach(async (tag) => {
			const id_rough = await convertNameToID(tag);
			if (id_rough.title === 'Success') {
				const id_clean=  id_rough.message.split(':')[1].trim();
				const student = await Student.findOne( { "discord_id" : id_clean } );
				student.updateOne({ "team_name": "Team " + teamName }).then((updated) => {
					console.log(updated);
				})
			}
		});
	}
	
	// console.log(result);

	return res.send(result);
})

app.post('/deleteTeam', async (req, res) => {
	const { teamID, categoryID, reason } = req.body;

	if (!teamID || !categoryID || !reason) {
		return res.send({ success: false, message: 'Missing Parameters' });
	}

	const result = await deleteTeam(teamID, categoryID, reason);
	// console.log(result);

	return res.send(result);
});

app.post('/addMember', async (req, res) => {
	const { member, role } = req.body;

	if (!member || !role) {
		return res.send({ success: false, message: `Missing Parameters\nMember: ${member}\nRole: ${role}` });
	}

	const result = await addMember(member, role);

	return res.send(result);
});

app.post('/removeMember', async (req, res) => {
	const { member, role } = req.body;

	if (!member || !role) {
		return res.send({ success: false, message: `Missing Parameters\nMember: ${member}\nRole: ${role}` });
	}

	const result = await removeMember(member, role);

	return res.send(result);
});

app.post('/convertNameToID', async (req, res) => {
	const { name } = req.body;

	if (!name) {
		return res.send({ success: false, message: 'Missing Parameters' });
	}

	const result = await convertNameToID(name);
	// console.log(result);

	return res.send(result);
});

app.get('/getAllUsers', async (req, res) => {
	const result = await getAllUsers();
	// console.log(result);

	return res.send(result);
});

app.get('/', function(req, res, next) {
    res.send("HELLO WORLD");
})


module.exports = app;

