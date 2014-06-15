define(function (require) {

    'use strict';

    var Facade = require('facade'),
        Gamepad = require('gamepad'),
        Game = require('game'),
        titleScene = new Game.Scene('title'),
        gameScene = require('js/game.js');

    titleScene.init(function (game) {

        var i;

        this.assets = {};
        this.methods = {};

        this.gamepad = new Gamepad();

        this.assets.sky = new Facade('sky', game.stage.width(), game.stage.height());

        this.assets.sky.context.fillStyle = '#fff';

        for (i = 0; i < 1000; i += 1) {

            this.assets.sky.context.globalAlpha = Math.round(Math.random() * 100) / 100;

            this.assets.sky.context.fillRect(
                Math.round(Math.random() * this.assets.sky.width()),
                Math.round(Math.random() * this.assets.sky.height()),
                1,
                1
            );

        }

        this.assets.title = new Facade.Image('images/logo@2x.png', {
            x: game.stage.width() / 2,
            y: game.stage.height() / 2,
            scale: 0.5,
            anchor: 'center'
        });

        this.methods.handlePressToStart = function (e) {

            if (!e.metaKey) {

                e.preventDefault();

                game.pushScene(gameScene);

            }

        };

        this.gamepad.on('press', 'button_1', function () {

            game.pushScene(gameScene);

        });

    });

    titleScene.draw(function (game) {

        game.stage.clear();

        game.stage.context.save();

        game.stage.context.globalAlpha = (Math.random() * 50 + 50) / 100;

        game.stage.context.drawImage(this.assets.sky.canvas, 0, 0);

        game.stage.context.restore();

        game.stage.addToStage(this.assets.title);

        game.stage.canvas.addEventListener('click', this.methods.handlePressToStart);
        document.addEventListener('keydown', this.methods.handlePressToStart);

    });

    titleScene.resume(function (game) {

        this.gamepad.resume();

        game.stage.canvas.addEventListener('click', this.methods.handlePressToStart);
        document.addEventListener('keydown', this.methods.handlePressToStart);

    });

    titleScene.pause(function (game) {

        this.gamepad.pause();

        game.stage.canvas.removeEventListener('click', this.methods.handlePressToStart);
        document.removeEventListener('keydown', this.methods.handlePressToStart);

    });

    titleScene.destory(function (game) {

        game.stage.canvas.removeEventListener('click', this.methods.handlePressToStart);
        document.removeEventListener('keydown', this.methods.handlePressToStart);

        delete this.assets;
        delete this.methods;

    });

    return titleScene;

});
