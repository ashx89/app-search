var Models = require(global.__base + '/manager');

var fetch = function onFetch(req, res, next) {
	var model = '';
	var query = {};
	var validation = '';

	var pagination = {
		page: (req.query.page) ? parseInt(req.query.page, 10) : 1,
		limit: (req.query.limit) ? parseInt(req.query.limit, 10) : parseInt(process.env.APPLICATION_SEARCH_LIMIT, 10),
		select: (req.query.select) ? req.query.select.replace(/,/g, ' ') : undefined,
	};

	switch (req.params.model) {
	case 'users':
		model = Models.UserModel;
		pagination.sort = (req.query.sort) ? req.query.sort.replace(/,/g, ' ') : 'lastname';
		break;
	case 'accounts':
		model = Models.AccountModel;
		(req.query.lat) ? query = {
			'address.location': {
				$near: {
					$geometry: {
						type: 'Point',
						coordinates: [req.query.lat, req.query.lng]
					},
					$maxDistance: req.query.distance || 500
				}
			}
		} : {};
		pagination.sort = (req.query.sort) ? req.query.sort.replace(/,/g, ' ') : 'storename';
		break;
	default:
		model = Models.ProductModel;
		query = { type: req.params.model };
		validation = process.env.APPLICATION_PRODUCTS.split(',').indexOf(req.params.model) >= 0;
		pagination.sort = (req.query.sort) ? req.query.sort.replace(/,/g, ' ') : 'user';
		if (!validation) return next();
		break;
	}

	var resultsObject = {
		items: []
	};

	model.paginate(query, pagination).then(function onPaginate(result) {
		if (!result.docs.length) return next(new Error('Items not found'));

		resultsObject.meta = {
			total: result.total,
			limit: result.limit,
			page: result.page,
			pages: result.pages
		};

		resultsObject.items = result.docs;

		return res.status(200).json(resultsObject);
	});
};

module.exports = fetch;
