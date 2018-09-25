const { google } = require("googleapis");
const sheets = google.sheets("v4");
const authorize = require("./googleOAuth");


const { promisify } = require("util");

sheets.spreadsheets.create[promisify.custom] = (request) => {
    return new Promise((resolve, reject) => {
        sheets.spreadsheets.create(request, (err, response) => {
            if(err) return reject(err);
            return resolve(response);
        })
    });
}
const publish = promisify(sheets.spreadsheets.create);

const Sheets = (weeks) => {
	return weeks.map((week, i) => {
		return {
			properties: {
				title: "Week " + (i + 1),
				tabColor: {
					green: 1.0
				}
			}
		};
	});
};

const SpreadSheet = async (template) => {
	let authClient = await authorize();

	let request = {
		resource: {
			properties: {
				title: "My 5-3-1 Program"
			},
			sheets: Sheets(template.weeks)
		},
		auth: authClient
    };
    
    let response;
    try {
        response = await publish(request);
    } catch(err) {
		return err;
    }

    return {
        spreadsheetUrl : response.data.spreadsheetUrl,
        title : response.data.properties.title
    }
};

module.exports = SpreadSheet;
