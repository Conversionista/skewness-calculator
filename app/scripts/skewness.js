function skewness(arr){
    // trafikberäkning för skewed fördelningar
    // e([x-e(x)]^3) / [Var(x)]^1.5
    
    // variabler för uträkningar
    var sumformean = 0,
        dataPoints = arr,
        mean,
        sumforvariance = 0,
        variance,
        tmp = 0,
        sumfornestedEofX = 0,
        nestedEofX,
        s,
        obj = {};

    for (var i = dataPoints.length - 1; i >= 0; i--) {
        sumformean += dataPoints[i];
    }

    mean = sumformean / dataPoints.length;

    // räkna ut delsummor för variansen och för e([x-e(x)]^3)
    for (var i = dataPoints.length - 1; i >= 0; i--) {
        tmp = dataPoints[i] - mean;
        sumfornestedEofX += Math.pow(tmp, 3);
        sumforvariance += Math.pow(tmp, 2);
    }

    // Var(X) = (sum(x-u)^2 / n-1)
    variance = sumforvariance / (dataPoints.length - 1);
    console.log('Variance: ' + variance);
    obj['variance'] = variance;
    obj['standardDeviation'] = Math.pow(variance, 0.5);
    // E(X-E(X))


    nestedEofX = sumfornestedEofX / dataPoints.length;
    console.log('nestedEofX: ' + nestedEofX);
    

    //and finally

    if(variance === 0){
        obj['skewness'] = 0;
    } else {
        s = nestedEofX / Math.pow(variance, 1.5);   
        console.log('Skewness: ' + s);
        obj['skewness'] = s;
    }

    if (Math.abs(s) >= 1){
        obj['traffic'] = 355 * Math.pow(s,2);
        // return 355 * Math.pow(s,2);
    } else {
        console.log('😞');
        // return 355;
        obj['traffic'] = 355;
    }

    return obj;

}