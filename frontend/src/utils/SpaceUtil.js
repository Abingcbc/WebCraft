
const isConflict = function (currentHeight, heightArray) {
    if (heightArray === undefined) {
        return true;
    }
    for (let i = 0; i < heightArray.length; i++) {
        if (heightArray[i].start * 100 <= currentHeight &&
            heightArray[i].end * 100 >= currentHeight) {
            return true;
        }
    }
    // console.log(currentHeight + "[" + heightArray[0].start*100 + "," +
    //     heightArray[0].end*100 + "]");
    return false;
};

const getHeight = function (heightArray) {
    return heightArray[heightArray.length-1].end*100;
};

export { isConflict, getHeight};
