'use strict';

const LOGIN_URL = 'https://www.instagram.com/accounts/login';
const credentials = require('../credentials');
var moment = require('moment');

class Instagram {

    constructor(crawlerTest) {
        this._crawler = crawlerTest;
    }

    execute() {
        return new Promise(resolve => {

            function populatePosts() {
                
                var media = _sharedData.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media;//eslint-disable-line
                var dadosUser = window._sharedData.entry_data.ProfilePage[0].graphql.user;

                window.instagram = {
                    totalPosts: media.count,
                    posts: media.edges,
                };

                var origOpen = XMLHttpRequest.prototype.open;
                XMLHttpRequest.prototype.open = function () {
                    this.addEventListener('load', function () {
                        var response = JSON.parse(this.responseText);
                        console.log('response :', response);
                        if (response.data) {
                            window.instagram.posts = window.instagram.posts.concat(response.data.user.edge_owner_to_timeline_media.edges);
                            console.log('posts :', window.instagram.posts);
                        }
                    });
                    origOpen.apply(this, arguments);
                };
                return {
                    totalPosts: window.instagram.totalPosts,
                    totalFound: window.instagram.posts.length
                };
            }

            // this._crawler.driver.manage().window().maximize();

            this._crawler.authenticate({
                loginURL: LOGIN_URL,
                user: {
                    xpath: "(//input[ @name='username' ])[1]",
                    data: credentials.user
                },
                pass: {
                    xpath: "(//input[@type='password'])[1]",
                    data: credentials.pass
                },
                cookies: true
            });

            this._crawler.goTo(Instagram.URL);

            this._crawler.sleep(5000);

            this._crawler.executeInflow(() => this._crawler.loggerInfo('Iniciando execução script..'));

            this._crawler.executeScript(populatePosts).then(result => {
                this._crawler.loggerInfo(`Coletando ${result.totalFound} de ${result.totalPosts}`, false);
                if (result.totalFound < result.totalPosts) {
                    this.scroll();
                }
                this.getPosts().then(posts => {
                    resolve(Instagram.populatePost(posts));
                });
            });
        });
    }

    getPosts() {
        return this._crawler.executeScript(function () {
            return window.instagram.posts;
        });
    }

    
    scroll() {

        this._crawler.loggerInfo("Scrolling...");
        this._crawler.executeScript(function () {
            window.scrollTo(0, 500000);
        });

        this._crawler.sleep(5000);

        this._crawler.executeScript(function () {
            return {
                totalPosts: window.instagram.totalPosts,
                totalFound: window.instagram.posts.length
            };
        }).then(result => {
            this._crawler.loggerInfo(`Coletando ${result.totalFound} de ${result.totalPosts}`, false);
            if (result.totalPosts > result.totalFound) {
                this.scroll();
            }
        });

    }
    
    static populatePost(postData) {
        return postData.reduce((posts, post) => {
            post = post.node;
            

            let caption = post.caption;
            if (post.edge_media_to_caption && post.edge_media_to_caption.edges[0]) {
                caption = post.edge_media_to_caption.edges[0].node.text;
            }

            let likes = post.edge_liked_by;

            let comments = post.edge_media_to_comment;

            let video = post.is_video;

            let mentions = caption && caption.length != 0 && caption.match(/@[A-Za-z0-9._-]*/g) || null;
            
            let postObj = {
                dataPublicacao: moment(new Date((post.taken_at_timestamp || post.date) * 1000)).format('DD/MM/YYYY'),
                horaPublicacao: moment(new Date((post.taken_at_timestamp || post.date) * 1000)).format('HH:mm:ss'),
                imagens: [post.display_url || post.display_src],
                texto: caption ? caption : '',
                url: `${Instagram.URLBase}p/${post.code || post.shortcode}`,
                idPublicacao: post.id,
                likes: likes,
                comments: comments,
                video : video
            };

            if (mentions) {
                postObj['mencoes'] = mentions.map(function (item) {
                    item = item.replace('@', '');

                    if (item && item.endsWith && item.endsWith('.')) {
                        item = item.slice(0, item.length - 1);
                    }

                    let mention = {
                        'conta': item,
                        'idInstagram': item,
                        'urlPerfil': Instagram.URL + item
                    };
                    return mention;
                });
            }
            posts.push(postObj);
            return posts;
        }, []);
    }

    static get URL() {
        return 'https://www.instagram.com/rafinhagsantos/';
    }

    static get URLBase(){
        return 'https://www.instagram.com/';
    }

}

module.exports = Instagram;