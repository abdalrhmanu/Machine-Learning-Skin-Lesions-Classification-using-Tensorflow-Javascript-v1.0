// Code source: https://www.youtube.com/watch?v=HEQDRWMK6yY

// After the model loads we want to make a prediction on the default image.
// Thus, the user will see predictions when the page is first loaded.
const tf = require("@tensorflow/tfjs");

function simulateClick(tabID) {
	document.getElementById(tabID).click();
}

$("#image-selector").change(function () {
	let reader = new FileReader();
	reader.onload = function () {
		let dataURL = reader.result;
		$("#selected-image").attr("src", dataURL);
		$("#prediction-list").empty();
	}
	
	let file = $("#image-selector").prop('files')[0];
	reader.readAsDataURL(file);
			
	// Simulate a click on the predict button
	// This introduces a 0.5 second delay before the click.
	// Without this long delay the model loads but may not automatically
	// predict.
	setTimeout(simulateClick.bind(null,'predict-button'), 500);

});

let model;
(async function () {
	
	model = await tf.loadLayersModel('https://doccampaign.s3-ap-southeast-1.amazonaws.com/AI/model.json');
	$("#selected-image").attr("src", "public/images/samplepic.jpg")
	
	// Simulate a click on the predict button
	predictOnLoad();
})();

function predictOnLoad() {
	
	// Simulate a click on the predict button
	setTimeout(simulateClick.bind(null,'predict-button'), 1000);
};




$("#predict-button").click(async function () {
	
	let image = $('#selected-image').get(0);
	
	// Pre-process the image
	let tensor = tf.browser.fromPixels(image)
	.resizeNearestNeighbor([224,224])
	.toFloat();
	
	let offset = tf.scalar(127.5);
	
	tensor = tensor.sub(offset)
	.div(offset)
	.expandDims();
	
	// Pass the tensor to the model and call predict on it.
	// Predict returns a tensor.
	// data() loads the values of the output tensor and returns
	// a promise of a typed array when the computation is complete.
	// Notice the await and async keywords are used together.
	let predictions = await model.predict(tensor).data();
	let top3 = Array.from(predictions)
		.map(function (p, i) { // this is Array.map
			return {
				probability: p,
				className: SKIN_CLASSES[i] // we are selecting the value from the obj
			};
				
		}).sort(function (a, b) {
			return b.probability - a.probability;
				
		}).slice(0, 3);
	
	
$("#prediction-list").empty();
top3.forEach(function (p) {

	$("#prediction-list").append(`<li>${p.className}: ${p.probability.toFixed(6)}</li>`);

	
	});
	
	
});









