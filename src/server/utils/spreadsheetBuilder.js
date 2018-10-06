const { google } = require("googleapis");
const authorize = require("./googleOAuth");
const { promisify } = require("util");

const sheets = google.sheets("v4");

const ONE_REP_MAX_REP_MULTIPLIER = 0.0333;

sheets.spreadsheets.create[promisify.custom] = (request) => {
	return new Promise((resolve, reject) => {
		sheets.spreadsheets.create(request, (err, response) => {
			if (err) return reject(err);
			return resolve(response);
		});
	});
};
const publish = promisify(sheets.spreadsheets.create);

sheets.spreadsheets.batchUpdate[promisify.custom] = (request) => {
	return new Promise((resolve, reject) => {
		sheets.spreadsheets.batchUpdate(request, (err, response) => {
			if (err) return reject(err);
			return resolve(response);
		});
	});
};
const update = promisify(sheets.spreadsheets.batchUpdate);

const NamedRanges = {};
const CalculatedFormulaRanges = {};

//common border format
const Border = (style = "SOLID") => ({
	style: style,
	color: {
		alpha: 1
	}
});

//build cell border formats
const Borders = ({ top, bottom, left, right }, style = "SOLID") => ({
	...(top && { top: Border(style) }),
	...(bottom && { bottom: Border(style) }),
	...(left && { left: Border(style) }),
	...(right && { right: Border(style) })
});

const SetHeaders = (day, i) => [
	{
		values: [
			{
				userEnteredValue: {
					stringValue: `Day ${i + 1}`
				},
				userEnteredFormat: {
					horizontalAlignment: "CENTER",
					backgroundColor: { red: 0.72, green: 0.72, blue: 0.72, alpha: 1 },
					borders: Borders({ top: true, bottom: true, left: true, right: true })
				}
			}
		]
	},
	{
		values: [
			{
				userEnteredValue: {
					stringValue: "Movement"
				},
				userEnteredFormat: {
					horizontalAlignment: "CENTER",
					backgroundColor: { red: 0.8, green: 0.8, blue: 0.8, alpha: 1 },
					borders: Borders({ bottom: true, left: true })
				}
			},

			{
				userEnteredValue: {
					stringValue: day.movement
				},
				userEnteredFormat: {
					textFormat: {
						bold: true
					},
					horizontalAlignment: "CENTER",
					backgroundColor: { red: 0.8, green: 0.8, blue: 0.8, alpha: 1 },
					borders: Borders({ bottom: true, right: true })
				}
			}
		]
	},
	{
		values: [
			{
				userEnteredValue: {
					stringValue: "Percent"
				},
				userEnteredFormat: {
					horizontalAlignment: "CENTER",
					backgroundColor: { red: 0.93, green: 0.93, blue: 0.93, alpha: 1 },
					borders: Borders({ bottom: true, left: true })
				}
			},
			{
				userEnteredValue: {
					stringValue: "Weight"
				},
				userEnteredFormat: {
					horizontalAlignment: "CENTER",
					backgroundColor: { red: 0.93, green: 0.93, blue: 0.93, alpha: 1 },
					borders: Borders({ bottom: true })
				}
			},
			{
				userEnteredValue: {
					stringValue: "Target Reps"
				},
				userEnteredFormat: {
					horizontalAlignment: "CENTER",
					backgroundColor: { red: 0.93, green: 0.93, blue: 0.93, alpha: 1 },
					borders: Borders({ bottom: true })
				}
			},
			{
				userEnteredValue: {
					stringValue: "Total Reps"
				},
				userEnteredFormat: {
					horizontalAlignment: "CENTER",
					backgroundColor: { red: 0.93, green: 0.93, blue: 0.93, alpha: 1 },
					borders: Borders({ bottom: true, right: true })
				}
			}
		]
	}
];

const Sets = (sets, day, week) =>
	sets.map((set, i) => ({
		values: [
			{
				userEnteredValue: {
					numberValue: set.percent
				},
				userEnteredFormat: {
					numberFormat: {
						type: "PERCENT",
						pattern: "##%"
					},
					horizontalAlignment: "CENTER",
					borders: Borders({ bottom: i === sets.length - 1, left: true })
				}
			},

			{
				userEnteredValue: {
					formulaValue: `=ROUNDDOWN(INDEX(Maxes,MATCH(Week_${week}_DAY_${day}_MOVEMENT, Movements,0),0) * INDEX(Week_${week}_DAY_${day}_PERCENTAGES,${i +
						1},1))`
				},

				userEnteredFormat: {
					numberFormat: {
						type: "NUMBER"
					},
					horizontalAlignment: "CENTER",
					borders: Borders({ bottom: i === sets.length - 1 })
				}
			},
			{
				userEnteredValue: {
					numberValue: set.reps
				},
				userEnteredFormat: {
					numberFormat: {
						type: "NUMBER",
						pattern: "##".concat(i === sets.length - 1 ? " ++" : "")
					},
					horizontalAlignment: "CENTER",
					borders: Borders({ bottom: i === sets.length - 1 })
				}
			},
			{
				userEnteredFormat: {
					numberFormat: {
						type: "NUMBER"
					},
					horizontalAlignment: "CENTER",
					borders: Borders(
						{
							top: i === 0,
							bottom: i === sets.length - 1,
							right: true,
							left: true
						},
						"SOLID_MEDIUM"
					)
				}
			},
			...(i === sets.length - 1
				? [
						{
							userEnteredValue: {
								formulaValue: `=IF(ISBLANK(INDEX(Week_${week}_DAY_${day}_COMPLETED_REPS,${i +
									1},1)), 0, ROUNDDOWN((INDEX(Week_${week}_DAY_${day}_WEIGHT,${i +
									1},1) * INDEX(Week_${week}_DAY_${day}_COMPLETED_REPS,${i +
									1},1) * ${ONE_REP_MAX_REP_MULTIPLIER}) + INDEX(Week_${week}_DAY_${day}_WEIGHT, ${i +
									1}, 1)))`
							},
							userEnteredFormat: {
								textFormat: {
									foregroundColor: {
										red: 1,
										green: 1,
										blue: 1,
										alpha: 0
									}
								}
							}
						}
				  ]
				: [])
		]
	}));

const DayStartRow = (i, days) => {
	let startRow = 2;
	for (let j = 0; j < i; j++) {
		startRow += 3 + days[j].sets.length + 2;
	}

	return startRow;
};

const SheetMerges = (days, sheetId) => {
	let arr = [];

	days.forEach((day, i) => {
		let startRow = DayStartRow(i, days);
		arr.push({
			sheetId: sheetId,
			startRowIndex: startRow,
			endRowIndex: startRow + 1,
			startColumnIndex: 0,
			endColumnIndex: 4
		});

		arr.push({
			sheetId: sheetId,
			startRowIndex: startRow + 1,
			endRowIndex: startRow + 2,
			startColumnIndex: 1,
			endColumnIndex: 4
		});
	});

	return arr;
};

const Days = (days, week) =>
	days.map((day, i) => ({
		startRow: DayStartRow(i, days),
		startColumn: 0,
		rowData: SetHeaders(day, i).concat(Sets(day.sets, i + 1, week))
	}));

const ConditionalFormats = (week, sheetId) => {
	let arr = [];

	week.days.forEach((day, i) => {
		day.sets.forEach((set, j) => {
			let week_day = "Week_" + (i + 1) + "_DAY_" + (j + 1);

			arr.push({
				ranges: [NamedRanges[`${week_day}_COMPLETED_REPS`].range],
				booleanRule: {
					condition: {
						type: "NUMBER_GREATER_THAN_EQ",
						values: [
							{
								userEnteredValue: `=INDEX(${week_day}_TARGET_REPS,${j + 1},1)`
								
							}
						]
					},
					format: {
						textFormat: {
							foregroundColor: {
								green: 1
							}
						}
					}
				}
			});
		});
	});

	return arr;
};

const Weeks = (weeks) =>
	weeks.map((week, i) => ({
		properties: {
			sheetId: i + 1,
			title: `Week ${i + 1}`,
			tabColor: {
				red: 1.0
			}
		},

		data: Days(week.days, i + 1),
		merges: SheetMerges(week.days, i + 1)

	}));

const MaxesHeaders = () => [
	{
		startRow: 1,
		startColumn: 0,
		rowData: [
			{
				values: [
					{
						userEnteredValue: {
							stringValue: "Movement"
						},
						userEnteredFormat: {
							horizontalAlignment: "CENTER",
							backgroundColor: {
								red: 0.8,
								green: 0.8,
								blue: 0.8,
								alpha: 1
							},
							borders: Borders({
								top: true,
								bottom: true,
								left: true,
								right: true
							})
						}
					},
					{
						userEnteredValue: {
							stringValue: "Working 1 Rep Max"
						},
						userEnteredFormat: {
							horizontalAlignment: "CENTER",
							backgroundColor: {
								red: 0.8,
								green: 0.8,
								blue: 0.8,
								alpha: 1
							},
							borders: Borders({ top: true, bottom: true })
						}
					},
					{
						userEnteredValue: {
							stringValue: "Calculated 1 Rep Max"
						},
						userEnteredFormat: {
							horizontalAlignment: "CENTER",
							backgroundColor: {
								red: 0.8,
								green: 0.8,
								blue: 0.8,
								alpha: 1
							},
							borders: Borders({ top: true, bottom: true, right: true })
						}
					}
				]
			}
		]
	}
];

const OneRepMaxes = (movements) =>
	MaxesHeaders().concat(
		movements.map((movement, i) => ({
			startRow: i + 2,
			startColumn: 0,
			rowData: [
				{
					values: [
						{
							userEnteredValue: {
								stringValue: movement
							},
							userEnteredFormat: {
								borders: Borders({
									bottom: i === movements.length - 1,
									left: true
								})
							}
						},
						{
							userEnteredValue: {
								numberValue: 0
							},
							userEnteredFormat: {
								horizontalAlignment: "CENTER",
								borders: Borders(
									{
										top: i == 0,
										bottom: i === movements.length - 1,
										left: true,
										right: true
									},
									"SOLID_MEDIUM"
								),
								numberFormat: {
									type: "NUMBER",
									pattern: "##"
								}
							}
						},
						{
							userEnteredValue: {
								formulaValue: `=MAX(${CalculatedFormulaRanges[movement]})`
							},
							userEnteredFormat: {
								horizontalAlignment: "CENTER",
								borders: Borders({
									bottom: i === movements.length - 1,
									right: true
								}),
								numberFormat: {
									type: "NUMBER",
									pattern: "##"
								}
							}
						}
					]
				}
			]
		}))
	);

const Maxes = (movements) => ({
	properties: {
		sheetId: 0,
		title: "1 REP MAXES",
		tabColor: {
			red: 1.0
		}
	},
	data: OneRepMaxes(movements)
});

const AddNamedRange = (key, range) => {
	NamedRanges[key] = {
		namedRangeId: key,
		name: key,
		range: range
	};
};

const GenerateNamedRanges = (template) => {
	AddNamedRange("Movements", {
		sheetId: 0,
		startRowIndex: 2,
		endRowIndex: template.movements.length + 2,
		startColumnIndex: 0,
		endColumnIndex: 1
	});

	template.movements.forEach((movement) => {
		CalculatedFormulaRanges[movement] = [];
	});

	AddNamedRange("Maxes", {
		sheetId: 0,
		startRowIndex: 2,
		endRowIndex: template.movements.length + 2,
		startColumnIndex: 1,
		endColumnIndex: 2
	});

	template.weeks.forEach((week, i) => {
		week.days.forEach((day, j) => {
			let startRow = DayStartRow(j, week.days);
			let week_day = `Week_${i + 1}_DAY_${j + 1}`;

			AddNamedRange(`${week_day}_MOVEMENT`, {
				sheetId: i + 1,
				startRowIndex: startRow + 1,
				endRowIndex: startRow + 2,
				startColumnIndex: 1,
				endColumnIndex: 2
			});

			AddNamedRange(`${week_day}_PERCENTAGES`, {
				sheetId: i + 1,
				startRowIndex: startRow + 3,
				endRowIndex: startRow + 3 + day.sets.length,
				startColumnIndex: 0,
				endColumnIndex: 1
			});

			AddNamedRange(`${week_day}_WEIGHT`, {
				sheetId: i + 1,
				startRowIndex: startRow + 3,
				endRowIndex: startRow + 3 + day.sets.length,
				startColumnIndex: 1,
				endColumnIndex: 2
			});

			AddNamedRange(`${week_day}_TARGET_REPS`, {
				sheetId: i + 1,
				startRowIndex: startRow + 3,
				endRowIndex: startRow + 3 + day.sets.length,
				startColumnIndex: 2,
				endColumnIndex: 3
			});

			AddNamedRange(`${week_day}_COMPLETED_REPS`, {
				sheetId: i + 1,
				startRowIndex: startRow + 3,
				endRowIndex: startRow + 3 + day.sets.length,
				startColumnIndex: 3,
				endColumnIndex: 4
			});

			let formulaNamedRange = `${week_day}_CALCULATED_MAX`;
			CalculatedFormulaRanges[day.movement].push(formulaNamedRange);

			AddNamedRange(formulaNamedRange, {
				sheetId: i + 1,
				startRowIndex: startRow + 3 + day.sets.length - 1,
				endRowIndex: startRow + 3 + day.sets.length,
				startColumnIndex: 4,
				endColumnIndex: 5
			});
		});
	});
};

//protected and auto-sized functions must be requested after sheet has been created
const ProtectAndFormatRequests = (template) => {
	let requests = [{
		addProtectedRange : {
			protectedRange : {
				range : {
					sheetId : 0
				},
				warningOnly : true,
				unprotectedRanges : NamedRanges["Maxes"]["range"]
			}
		}
	}];

	template.weeks.forEach((week, i) => {
		requests.push({
			autoResizeDimensions: {
				dimensions: {
					sheetId: i,
					dimension: "COLUMNS"
				}
			}
		});

		requests.push({
			addProtectedRange: {
				protectedRange: {
					range: {
						sheetId: i + 1
					},
					warningOnly : true,
					unprotectedRanges: Object.values(NamedRanges)
						.filter(
							(range) =>
								range.namedRangeId.startsWith(`Week_${i + 1}_`) &&
								range.namedRangeId.endsWith("_COMPLETED_REPS")
						)
						.map((namedRange) => namedRange["range"])
				}
			}
		});
	});

	return requests;
}

const SpreadSheet = async (template) => {
	let authClient = await authorize();

	GenerateNamedRanges(template);

	let response;
	try {
		response = await publish({
			resource: {
				properties: {
					title: "My 5-3-1 Program"
				},
				sheets: [Maxes(template.movements)].concat(Weeks(template.weeks)),
				namedRanges: Object.values(NamedRanges)
			},
			auth: authClient
		});

		update({
			spreadsheetId: response.data.spreadsheetId,
			resource: {
				requests: ProtectAndFormatRequests(template)
			},
	
			auth: authClient
		});
	} catch (err) {
		console.log(err);
		return err.message;
	}


	return {
		spreadsheetUrl: response.data.spreadsheetUrl,
		title: response.data.properties.title
	};
};

module.exports = SpreadSheet;
