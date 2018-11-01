module.exports = {
	"env": {
		"browser": false,
		"es6": true,
		"node": true,
		"mocha": true
	},
	"extends": "airbnb-base",
	"parserOptions": {
		"ecmaVersion": 2018
	},
	"plugins": [
		"prefer-object-spread"
	],
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"single"
		],
		"require-yield": "off",
		"semi": [
			"error",
			"always"
		],
		"no-var": "error",
		"no-unused-vars": "error",
		"prefer-const": "error",
		"no-tabs": "off",
		"max-len": "off",
		"no-confusing-arrow": "off",
		"comma-dangle": "off",
		"no-unused-expressions": "off",
		"global-require": "off",
		"no-return-assign": "off",
		"no-use-before-define": "off",
		"no-underscore-dangle": "off",
		"object-curly-newline": "off",
		"arrow-body-style": "off",
		"prefer-object-spread/prefer-object-spread": "error",
		"prefer-destructuring": "off",
		"consistent-return": "off",
		"object-curly-spacing": [
			"error",
			"always"
		],
		"rest-spread-spacing": [
			"error",
			"never"
		]
	}
};