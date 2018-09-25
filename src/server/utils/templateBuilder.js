const SetOutline = (percent, reps) => {
	return {
		percent: percent,
		reps: reps
	};
};

const MovementSet = (mvmt, outline) => {
	return { ...{ movement: mvmt }, ...outline };
};


const buildProgramTemplate = (daysPerWeek = 4, movements = ["bs", "sp", "fs", "dl", "ohs", "pp"]) => {
	const outline = [
		[SetOutline(0.58, 5), SetOutline(0.67, 5), SetOutline(0.76, 5)],
		[SetOutline(0.63, 3), SetOutline(0.72, 3), SetOutline(0.81, 3)],
		[SetOutline(0.67, 5), SetOutline(0.76, 3), SetOutline(0.85, 1)],
		[SetOutline(0.61, 5), SetOutline(0.7, 5), SetOutline(0.79, 5)],
		[SetOutline(0.65, 3), SetOutline(0.74, 3), SetOutline(0.83, 3)],
		[SetOutline(0.7, 5), SetOutline(0.79, 3), SetOutline(0.88, 1)],
		[SetOutline(0.65, 5), SetOutline(0.74, 5), SetOutline(0.83, 5)],
		[SetOutline(0.69, 3), SetOutline(0.78, 3), SetOutline(0.87, 3)],
		[SetOutline(0.73, 5), SetOutline(0.82, 3), SetOutline(0.91, 1)]
	];

	var days = [];

	outline.forEach((cycle) => {
		days = days.concat(
			movements.map((mvmt) => {
				return { sets : cycle.map((set) => {
					return MovementSet(mvmt, set);
				})};
			})
		);
	});


    var program = {
        movements : movements,
        description : "5-3-1",
        daysPerWeek : daysPerWeek,
        weeks : []
    };

    while (days.length) {
        program.weeks.push({
            days : days.splice(0, daysPerWeek)
        })
    }

	return program;
};

module.exports = buildProgramTemplate;
