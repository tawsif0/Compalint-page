// https://www.linkedin.com/in/atakangk/
//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches

$(".next").click(function () {
  if (animating) return false;
  animating = true;

  current_fs = $(this).parent();
  next_fs = $(this).parent().next();

  //activate next step on progressbar using the index of next_fs
  $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

  //show the next fieldset
  next_fs.show();
  //hide the current fieldset with style
  current_fs.animate(
    { opacity: 0 },
    {
      step: function (now, mx) {
        //as the opacity of current_fs reduces to 0 - stored in "now"
        //1. scale current_fs down to 80%
        scale = 1 - (1 - now) * 0.2;
        //2. bring next_fs from the right(50%)
        left = now * 50 + "%";
        //3. increase opacity of next_fs to 1 as it moves in
        opacity = 1 - now;
        current_fs.css({
          transform: "scale(" + scale + ")",
          position: "absolute"
        });
        next_fs.css({ left: left, opacity: opacity });
      },
      duration: 800,
      complete: function () {
        current_fs.hide();
        animating = false;
      },
      //this comes from the custom easing plugin
      easing: "easeInOutBack"
    }
  );
});

$(".previous").click(function () {
  if (animating) return false;
  animating = true;

  current_fs = $(this).parent();
  previous_fs = $(this).parent().prev();

  //de-activate current step on progressbar
  $("#progressbar li")
    .eq($("fieldset").index(current_fs))
    .removeClass("active");

  //show the previous fieldset
  previous_fs.show();
  //hide the current fieldset with style
  current_fs.animate(
    { opacity: 0 },
    {
      step: function (now, mx) {
        //as the opacity of current_fs reduces to 0 - stored in "now"
        //1. scale previous_fs from 80% to 100%
        scale = 0.8 + (1 - now) * 0.2;
        //2. take current_fs to the right(50%) - from 0%
        left = (1 - now) * 50 + "%";
        //3. increase opacity of previous_fs to 1 as it moves in
        opacity = 1 - now;
        current_fs.css({ left: left });
        previous_fs.css({
          transform: "scale(" + scale + ")",
          opacity: opacity
        });
      },
      duration: 800,
      complete: function () {
        current_fs.hide();
        animating = false;
      },
      //this comes from the custom easing plugin
      easing: "easeInOutBack"
    }
  );
});
document.querySelectorAll(".otp-input").forEach((input, index, inputs) => {
  input.addEventListener("input", (e) => {
    if (e.target.value.length === 1 && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && index > 0 && !e.target.value) {
      inputs[index - 1].focus();
    }
  });
});

// Audio recording and playback

const recordButton = document.getElementById("record-audio");
const audioPlayback = document.getElementById("audio-playback");
const recordingIndicator = document.getElementById("recording-indicator");

let mediaRecorder;
let audioChunks = [];
let isRecording = false; // To track recording state

// Function to check permissions
async function checkPermissions() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop()); // Stop the stream immediately
    return true;
  } catch (err) {
    console.error("Microphone permission error:", err);
    return false;
  }
}

// Function to handle start/stop recording logic
async function toggleRecording() {
  const hasPermission = await checkPermissions();
  if (!hasPermission) {
    alert("Please grant microphone access in your browser settings.");
    return;
  }

  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);

      // Handle the data when the recording stops
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
        const audioURL = URL.createObjectURL(audioBlob);
        audioPlayback.src = audioURL;
        audioPlayback.hidden = false; // Show playback
        audioPlayback.controls = true; // Add audio controls
        recordingIndicator.style.display = "none"; // Hide indicator when recording stops
      };

      // Clear previous chunks and start recording
      audioChunks = [];
      mediaRecorder.start();
      isRecording = true;
      recordButton.textContent = "Stop Recording"; // Update button text
      recordingIndicator.style.display = "block"; // Show indicator when recording starts
      console.log("Recording started");
    } catch (error) {
      console.error("Error accessing microphone: ", error);
      alert("Could not access your microphone. Please check your permissions.");
    }
  } else {
    mediaRecorder.stop();
    isRecording = false;
    recordButton.textContent = "Start Recording"; // Reset button text
    console.log("Recording stopped");
  }
}

// Event listener for the button
recordButton.addEventListener("click", function (event) {
  event.preventDefault(); // Prevent any default behavior (like form submission)
  toggleRecording();
});
