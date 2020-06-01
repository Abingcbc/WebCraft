
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

const getHeight = function (y, heightArray) {
    if (heightArray[heightArray.length-1].end * 100 < y) {
        return heightArray[heightArray.length-1].end;
    }
    for (let i = 0; i < heightArray.length-1; i++) {
        if (heightArray[i].end * 100 < y && y < heightArray[i+1].start * 100) {
            return heightArray[i].end;
        }
    }
};

export { isConflict, getHeight};
