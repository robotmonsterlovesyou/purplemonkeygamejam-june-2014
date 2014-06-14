define(function (require) {

    'use strict';

    var Facade = require('facade'),
        Game = require('game'),
        Gamepad = require('gamepad'),
        $ = require('jquery'),
        Box2D = require('box2dweb'),
        gameScene = new Game.Scene('game');

    require('facadejs-Box2D');

    gameScene.init(function () {

        var self = this;

        this.world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 40), false);

        this.assets = {
            player: null,
            map: [],
            camera: [0, 0]
        };
        this.methods = {};

        this.gamepad = new Gamepad();

        $.get('data/level1.json').done(function (data) {

            self.assets.player = new Facade.Polygon(data.player.options);

            self.assets.player.Box2D('createObject', self.world, data.player.settings);

            self.gamepad.on('hold', 'd_pad_left', function () {

                self.assets.player.Box2D('setVelocity', -data.player.properties.speed, self.assets.player.Box2D('getVelocity').y);

            });

            self.gamepad.on('hold', 'd_pad_right', function () {

                self.assets.player.Box2D('setVelocity', data.player.properties.speed, self.assets.player.Box2D('getVelocity').y);

            });

            $.get(data.map.file).done(function (svg) {

                Array.prototype.slice.call(svg.getElementsByTagName('path')).forEach(function (tag) {

                    var coords = tag.getAttribute('d').replace(/[a-z]/ig, '').replace(/^\s|\s$/g, '').split(/\s/),
                        position = tag.parentNode.getAttribute('transform').match(/([0-9\.]+), ([0-9\.]+)/),
                        points = [],
                        object;

                    coords.pop(); // Prevent duplicate point (manual closing of polygon).

                    coords.forEach(function (coord) {

                        coord = coord.split(/\,/);

                        points.push([parseFloat(coord[0]), parseFloat(coord[1])]);

                    });

                    object = new Facade.Polygon($.extend({
                        x: position[1],
                        y: position[2],
                        points: points
                    }, data.map.options));

                    object.Box2D('createObject', self.world, data.map.setting);
                    self.assets.map.push(object);

                });

            });

        });

    });

    gameScene.draw(function (game) {

        game.stage.clear();

        this.world.Step(1 / 60, 8, 3);

        game.stage.context.save();

        game.stage.context.globalAlpha = (Math.random() * 50 + 50) / 100;

        game.stage.context.drawImage(game.getPreviousScene().assets.sky.canvas, 0, 0);

        game.stage.context.restore();

        if (this.assets.player) {

            game.stage.addToStage(this.assets.player, this.assets.player.Box2D('getCurrentState'));

        }

        if (this.assets.map.length) {

            game.stage.addToStage(this.assets.map);

        }

    });

    return gameScene;

});
