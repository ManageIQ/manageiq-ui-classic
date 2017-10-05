module.exports = {
    test:/\.html$/,
    use: [ {
        loader: 'html-loader',
        options: {
        minimize: true,
        removeAttributeQuotes: false,
        caseSensitive: true,
        customAttrSurround: [ [/#/, /(?:)/], [/\*/, /(?:)/], [/\[?\(?/, /(?:)/] ],
        customAttrAssign: [ /\)?\]?=/ ]
        }
    }]
}