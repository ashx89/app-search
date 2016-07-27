var User = require(global.__base + '/manager').UserModel;
var Account = require(global.__base + '/manager').AccountModel;

var fetch = function onFetch(req, res, next) {
	// ?limit={int}
	// ?page={int}
	// ?sort={csv}
	// ?select={csv}
	var resultsObject = {
		users: []
	};

	User.paginate({}, {
		page: (req.query.page) ? parseInt(req.query.page, 10) : 1,
		limit: (req.query.limit) ? parseInt(req.query.limit, 10) : process.env.APPLICATION_SEARCH_LIMIT,
		sort: (req.query.sort) ? req.query.sort.replace(/,/g, ' ') : 'lastname',
		select: (req.query.select) ? req.query.select.replace(/,/g, ' ') : undefined,
	}).then(function onPaginate(result) {
		if (!result.docs.length) return next(new Error('Users not found'));

		resultsObject.found = {
			total: result.total,
			limit: result.limit,
			page: result.page,
			pages: result.pages
		};

		result.docs.forEach(function onEachUser(user, index) {
			Account.find({ user: user._id }, function onFind(err, account) {
				if (err) return next(err);

				resultsObject.users.push({ user: user, account: account });

				if (result.docs.length === index + 1) return res.status(200).json(resultsObject);
			});
		});
	});
};

module.exports = fetch;
