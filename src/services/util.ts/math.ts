/*
    COMMENTARY:

    1.  I usually group my helper functions in a util folder and separate them
        by their functionality (i.e time, math, array etc). For general functions like below,
        I prefer to have a shared library which I upload to the registry and install as a
        dependancy into my projects.

*/

export const roundToXdp = (float: number, decimals: number) =>
  Math.round(float * Math.pow(10, decimals)) / Math.pow(10, decimals);
