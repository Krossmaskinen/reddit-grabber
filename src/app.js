export class App {
    title;
    redditUrl = 'https://www.reddit.com';
    stream = '/r/gintama'
    posts = [];
    afterId;
    beforeId;
    limit = 5;
    redditWrap;
    noImage = 'images/no-image.gif';
    lightbox = new Lightbox();
    validStream = true;
    isLoading = true;

    constructor() {
        moment.locale('sv');
        this.fetchRedditPosts();
    }
    responseOKCallback(redditPosts) {
        this.setValidStream(true);
        this.title = this.stream;
        this.posts = redditPosts.data.children.map( (post) => post.data );
        this.redditWrap = document.querySelector('.reddit-posts');

        this.posts = this.getFilteredPosts(this.posts);
        this.posts = this.getProcessedPosts(this.posts);

        this.updateBeforeAndAfter(redditPosts);

        this.lightbox.load();
        this.setLoading(false);
    }
    fetchError(error) {
        this.setValidStream(false);
        this.setLoading(false);
        console.log(error);
    }
    updateBeforeAndAfter(response) {
        this.afterId = response.data.after || false;
        this.beforeId = response.data.before || false;
    }
    fetchRedditPosts(options) {
        let defaultData = {
                count: this.limit,
                limit: this.limit
            },
            data,
            headers = new Headers(),
            fetchOptions = {
                mode: 'cors',
                method: 'GET',
                headers: headers
            },
            fetchUrl;

        this.setLoading(true);

        if( options ) {
            data = this.extendObject({}, defaultData, options.data);
        } else {
            data = defaultData;
        }
        data = this.convertJSONToURI(data);

        fetchUrl = `${this.redditUrl}${this.stream}.json?${data}`;

        fetch(fetchUrl, fetchOptions)
            .then( (response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    console.log('wienerbrööööö');
                }
            })
            .then( (response) => {
                this.responseOKCallback(response);
            })
            .catch((error) => {
                this.fetchError(error);
            });
    }
    getFilteredPosts(posts) {
        return posts.filter( x => !x.stickied );
    }
    getProcessedPosts(posts) {
        posts.forEach( (post) => {
            post.formatted_created = moment.unix(post.created_utc).fromNow();
            post.thumbnail = (post.thumbnail !== '' && post.thumbnail !== 'self') ? post.thumbnail : this.noImage;
            post.text_class = (post.selftext !== '') ? '' : 'hidden';
            post.thumbnailPreview = (post.preview) ? post.preview.images[0].source.url : false;
        });

        return posts;
    }
    convertJSONToURI(jsonObj) {
        return Object.keys(jsonObj).map( (key) => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(jsonObj[key])}`;
        }).join('&');
    }
    fetchNext() {
        console.log( "next" );
        if(this.afterId != null) {
            this.fetchRedditPosts({
                data: {
                    after: this.afterId,
                    limit: this.limit,
                    count: this.limit
                }
            });
        }
    }
    fetchPrevious() {
        console.log( "prev" );
        if(this.beforeId != null) {
            this.fetchRedditPosts({
                data: {
                    before: this.beforeId,
                    limit: this.limit,
                    count: this.limit
                }
            });
        }
    }
    refreshRedditPosts() {
        let options = {
            data: {
                limit: this.limit,
                count: this.limit
            }
        }

        if(this.limit !== '' && !isNaN(this.limit)) {
            this.fetchRedditPosts(options);
        }
    }
    setLoading(state) {
        this.isLoading = state;
    }
    setValidStream(state) {
        this.validStream = state;
    }
    extendObject(out) {
        out = out || {};

        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i]) {
                continue;
            }

            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) {
                    out[key] = arguments[i][key];
                }
            }
        }

        return out;
    }
}