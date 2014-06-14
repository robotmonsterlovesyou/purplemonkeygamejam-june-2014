define(function (require) {

    var Facade = require('facade'),
        Game = require('game'),
        titleScene = new Game.Scene('title.js'),
        gameScene = require('js/game.js');

    titleScene.init(function (game) {

        this.assets = {};
        this.methods = {};

        this.assets.title = new Facade.Text('Light & Shadow', {
            x: game.stage.width() / 2,
            y: game.stage.height() / 2,
            fontFamily: 'Helvetica-Light',
            fontSize: 70,
            fillStyle: '#ffffff',
            textAlignment: 'center',
            anchor: 'center'
        });

        this.methods.handlePressToStart = function (e) {

            if (!e.metaKey) {

                e.preventDefault();

                game.pushScene(gameScene);

            }

        };

    });

    titleScene.draw(function (game) {

        game.stage.clear();

        game.stage.addToStage(this.assets.title);

        game.stage.canvas.addEventListener('click', this.methods.handlePressToStart);
        document.addEventListener('keydown', this.methods.handlePressToStart);

    });

    titleScene.destory(function (game) {

        game.stage.canvas.removeEventListener('click', this.methods.handlePressToStart);
        document.removeEventListener('keydown', this.methods.handlePressToStart);

        delete this.assets;
        delete this.methods;

    });

    return titleScene;

});
