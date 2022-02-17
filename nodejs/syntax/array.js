var array = ["A","B","C","D"];
var len = array.length;
console.log(array)
array[2] = "c";
console.log(array)
array[2] = 1;
console.log(array);
console.log(`배열의 길이 : ${len}`);
array.push("E");
len = array.length;
console.log(array);
console.log(`배열의 길이 : ${len}`);
