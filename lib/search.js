/**
 * @private
 * @constructor
 * @param {object} options
 */
function SearchInterface(options) {
	this.req = options.req;
	this.sort = options.sort ? options.sort.replace(/,/g, ' ') : undefined,
	this.query = options.query;
	this.model = options.model;
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

			return callback(null, resultsObject);
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
