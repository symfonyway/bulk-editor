let stopWords = ['stopWord'];

const descriptionStopWords = (desc) => {
    let isValid = true;
    desc = desc.replace(/\u00a0/g, " ").toLowerCase();

    stopWords.forEach(function (item) {
        const regex = new RegExp('\\b(\\w*' + item + '\\w*)\\b', 'ig');
        const match = desc.match(regex);

        if (match !== null) {
            match.forEach(function (k) {
                if (stopWords.exceptions.indexOf(k) === -1) {
                    // matches.indexOf('<b>' + item + '</b>') === -1 ? matches.push('<b>' + item + '</b>') : void (0);
                    isValid = false;
                }
            });
        }
    });

    return isValid;
};

export default descriptionStopWords;