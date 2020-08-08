// The next few block will run before the user upload an image
// It will predict an image for demonstration purpose 


// import { loadModel, fromPixels, scalar } from "@tensorflow/tfjs";
// import * as tf from '@tensorflow/tfjs';

// 1. LOAD THE MODEL IMMEDIATELY WHEN THE PAGE LOADS

// Define 2 helper functions
function simulateClick(tabID) {
	document.getElementById(tabID).click();
}

function predictOnLoad() {
	// Simulate a click on the predict button
	setTimeout(simulateClick.bind(null,'predict-button'), 500);
}

// LOAD THE MODEL
let model;
(async function () {
	console.log("before load model", model)
	// tf.---loadModel('https://firebasestorage.googleapis.com/v0/b/doc-referrals.appspot.com/o/test-tensorflow-json%2Fmodel.json')---;
	model = await tf.loadLayersModel('https://doccampaign.s3-ap-southeast-1.amazonaws.com/AI/model.json');
	console.log("after load model", model)
	// initial image for analysis (Real Analysis) - Confirm
	$("#selected-image").attr("src", "/images/samplepic.jpg"); 
	
	// Simulate a click on the predict button.
	// Make a prediction on the default front page image.
	predictOnLoad();
	
})();


// 2. MAKE A PREDICTION ON THE FRONT PAGE IMAGE WHEN THE PAGE LOADS

// The model images have resolution of 96x96, size of (width x height) 224x224 pixels
// This code is triggered when the predict button is clicked i.e.
// we simulate a click on the predict button.
$("#predict-button").click(async function () {
	let image = undefined;
	image = $('#selected-image').get(0);
	
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
	
	// TARGET_CLASSES is defined in the target_clssses.js file.
	// There's no need to load this file because it was imported in index.html
	let predictions = await model.predict(tensor).data();
	console.log("prediction", predictions)
	let top3 = Array.from(predictions)
		.map(function (p, i) { // this is Array.map
			return {
				probability: p,
				className: TARGET_CLASSES[i] 
			};
	
		}).sort(function (a, b) {
			return b.probability - a.probability;
				
		}).slice(0, 3); // we can change it to 1 so that we have only one prediction
	

		// Append the file name to the prediction list
		// var file_name = 'samplepic.jpg';
		// $("#prediction-list").append(`<li style="list-style-type:none;">${file_name}</li>`);
		
		//$("#prediction-list").empty();
		top3.forEach(function (p) {
		
			// ist-style-type:none removes the numbers.
			// https://www.w3schools.com/html/html_lists.asp
			$("#prediction-list").append(`<li style="list-style-type:none;">${p.className}: ${p.probability.toFixed(3)}</li>`);
		
		});
});



// 3. READ THE IMAGES THAT THE USER SELECTS
// Then direct the code execution to app_batch_prediction_code.js

// This listens for a change. It fires when the user submits images.

$("#image-selector").change(async function () {
	
	// the FileReader reads one image at a time
	fileList = $("#image-selector").prop('files');
	
	//$("#prediction-list").empty();
	
	// Start predicting
	// This function is in the app_batch_prediction_code.js file.
	model_processArray(fileList);
	
});


// Done - Refere back to re-correct and confirm classes, ids


