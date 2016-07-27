var Product = require(global.__base + '/manager').ProductModel;

var fetch = function onFetch(req, res, next) {
	if (process.env.APPLICATION_PRODUCTS.split(',').indexOf(req.params.product) === -1) return next(new Error('Resource not found'));

	var resultsObject = { products: [] };

	Product.paginate({ type: req.params.product }, {
		page: (req.query.page) ? parseInt(req.query.page, 10) : 1,
		limit: (req.query.limit) ? parseInt(req.query.limit, 10) : parseInt(process.env.APPLICATION_SEARCH_LIMIT, 10),
		sort: (req.query.sort) ? req.query.sort.replace(/,/g, ' ') : 'user',
		select: (req.query.select) ? req.query.select.replace(/,/g, ' ') : undefined,
	}).then(function onPaginate(result) {
		if (!result.docs.length) return next(new Error('Items not found'));

		resultsObject.found = {
			total: result.total,
			limit: result.limit,
			page: result.page,
			pages: result.pages
		};

		resultsObject.products = result.docs;

		return res.status(200).json(resultsObject);
	});
};

module.exports = fetch;
