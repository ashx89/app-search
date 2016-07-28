
function fetchExtendedData(resultsObject, callback) {
	resultsObject.items.forEach(function onEachItem(item) {
		this.extend.forEach(function onEachModel(data) {
			data.model.find({ user: item.user || item._id }, function onFindExtended(err, docs) {
				if (err) return callback(err, null);
				resultsObject[data.name] = docs;
				return callback(null, resultsObject);
			});
		});
	});
}

/**
 * @private
 * @constructor
 * @param {object} options
 */
function SearchInterface(options) {
	this.req = options.req;
	this.sort = options.sort ? options.sort.replace(/,/g, ' ') : undefined,
	this.route = options.req.params.model;
	this.query = options.query;
	this.model = options.model;
	this.extend = options.extend;
	this.validation = options.validation || false;

	this.pagination = {
		page: (this.req.query.page) ? parseInt(this.req.query.page, 10) : 1,

		limit: (this.req.query.limit) ?
			parseInt(this.req.query.limit, 10) :
			parseInt(process.env.APPLICATION_SEARCH_LIMIT, 10),

		select: (this.req.query.select) ?
			this.req.query.select.replace(/,/g, ' ') :
			undefined,
	};
}

SearchInterface.prototype.runSearch = function onRunSearch(callback) {
	var resultsObject = { items: [] };

	this.model.paginate(this.query, this.pagination)
		.then(function onPaginate(result) {
			resultsObject.meta = {
				total: result.total,
				limit: result.limit,
				page: result.page,
				pages: result.pages
			};

			resultsObject.items = result.docs;

			if (this.extend && this.extend.length) {
				fetchExtendedData(resultsObject, function onFetchExtended(err, results) {
					return callback(err, results);
				});
			} else {
				return callback(null, resultsObject);
			}
		});
};

/**
 * Constructs a configured search instance
 * @param {object} options
 */
module.exports = function onExports(options) {
	var config = options || {};
	var searchInstance = new SearchInterface(config);

	return searchInstance;
};
