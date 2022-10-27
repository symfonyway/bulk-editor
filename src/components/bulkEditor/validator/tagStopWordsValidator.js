let localStopWords = ['StopWord', 'best'];

const stopWords = (value) => {
    for (let i in localStopWords) {
        if (value.indexOf(localStopWords[i]) !== -1) {
            return false;
        }
    }

    return true;
};

export default stopWords;