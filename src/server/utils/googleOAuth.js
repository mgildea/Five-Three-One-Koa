const { google } = require("googleapis");
const fs = require("fs");
const readline = require("readline");

const credentials = require("../credentials.json");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const TOKEN_PATH = "token.json";

const { promisify } = require("util");
const readfile = promisify(fs.readFile);

const authorize = async () => {
	const { client_secret, client_id, redirect_uris } = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(
		client_id,
		client_secret,
		redirect_uris[0]
	);

	let token;
	try {
		token = JSON.parse(await readfile(TOKEN_PATH));
		oAuth2Client.setCredentials(token);
	} catch (err) {
		return await getNewToken(oAuth2Client);
	}

	return oAuth2Client;
	// fs.readFile(TOKEN_PATH, (err, token) => {
	// 	if (err) return getNewToken(oAuth2Client);
	// 	oAuth2Client.setCredentials(JSON.parse(token));
	// 	return oAuth2Client;
	// });
};

const getNewToken = async (oAuth2Client) => {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: "offline",
		scope: SCOPES
	});
	console.log("Authorize this app by visiting this url:", authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.question("Enter the code from that page here: ", (code) => {
		rl.close();
		oAuth2Client.getToken(code, (err, token) => {
			if (err)
				return console.error(
					"Error while trying to retrieve access token",
					err
				);
			oAuth2Client.setCredentials(token);
			// Store the token to disk for later program executions
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
				if (err) console.error(err);
				console.log("Token stored to", TOKEN_PATH);
			});

			return oAuth2Client;
			//callback(oAuth2Client);
		});
	});
};

module.exports = authorize;
