var User = require(global.__base + '/manager').UserModel;
var Account = require(global.__base + '/manager').AccountModel;

var fetch = function onFetch(req, res, next) {
	// ?limit={int}
	// ?page={int}
	// ?sort={csv}
	// ?select={csv}
	var resultsObject = {};

	User.paginate({}, {
		page: parseInt(req.query.page, 10) || 1,
		limit: parseInt(req.query.limit, 10) || 10,
		sort: req.query.sort.replace(/,/g, ' ') || 'lastname',
		select: req.query.select.replace(/,/g, ' ') || undefined,
	}).then(function onPaginate(result) {
		if (!result.docs.length) return next(new Error('Users not found'));

		resultsObject.pagination = {
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
