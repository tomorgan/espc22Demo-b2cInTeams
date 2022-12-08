import { CallClient, CallAgent, DeviceManager, LocalVideoStream, VideoStreamRenderer } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

const connectButton = document.getElementById('connect-button');
const disconnectButton = document.getElementById('disconnect-button');
const callStateElement = document.getElementById('call-state');
const destinationGroupElement = document.getElementById('destination-group-input');
const remoteVideoCollection = document.getElementById('remotevideo');
const videoButton = document.getElementById('video-button');
const participantList = document.getElementById('participants');

let call;
let callAgent;
let callClient;
let localVideoStream;
let localVideoRender;
let remoteVideos = [];

async function init() {
    
	
  //1. Get a token
  const response = await fetch('[URL TO YOUR FUNCTION APP HERE]');
  const responseJson = await response.json(); 
  const token = responseJson.value.accessToken.token;
  const tokenCredential = new AzureCommunicationTokenCredential(token);
  
  //2. Create a call Agent
  callClient = new CallClient();
  callAgent = await callClient.createCallAgent(tokenCredential);
  connectButton.disabled = false;
    
   //5. Get cameras, pick one
  const deviceManager = await callClient.getDeviceManager();
  const videoDevices = await deviceManager.getCameras();
  const videoDeviceInfo = videoDevices[0];
  localVideoStream = new LocalVideoStream(videoDeviceInfo);
  
  //6. Display local feed
   localVideoRender = new VideoStreamRenderer(localVideoStream);
    const view = await localVideoRender.createView();
    document.getElementById("selfVideo").appendChild(view.target);
}
init();




connectButton.addEventListener("click", () => {
	//3. Join a Call	
    const destinationToCall = { meetingLink: destinationGroupElement.value};
    const callJoinOptions = { videoOptions: { localVideoStreams: [localVideoStream] }};
	call = callAgent.join(destinationToCall, callJoinOptions);
    
	
	//4. Subscribe to events
    call.on('stateChanged', () => {
        callStateElement.innerText = call.state;
    });
	
	//7. Look for remote participants
	call.on('remoteParticipantsUpdated', () => {
		participantList.innerHTML = "";
		call.remoteParticipants.forEach(function(participant)
		{
			var el = document.createElement("li");
			el.appendChild(document.createTextNode(participant.identifier.microsoftTeamsUserId));				 
			participantList.appendChild(el);
		});
		
	});
	
	
    //Other: toggle button states
    disconnectButton.disabled = false;
    connectButton.disabled = true;
});

//8. See if remote participants have video
videoButton.addEventListener("click", () => {
	remoteVideoCollection.innerHTML = ""; //clear the video collection & start again
	call.remoteParticipants.forEach(function(participant) 
		{			
		let videoStream = participant.videoStreams.find(function (s) { return s.mediaStreamType === "Video" });
			if (videoStream && videoStream.isAvailable)
			{
				RenderParticipantStream(videoStream, remoteVideoCollection);
			}		
		})
});

disconnectButton.addEventListener("click", async () => {
    await call.hangUp();
  
    //Other: toggle button states
    disconnectButton.disabled = true;
    connectButton.disabled = false;
    callStateElement.innerText = '-';
  });
     

//9. Render remote participant video
async function RenderParticipantStream(stream, collection)
{	
		let renderer = new VideoStreamRenderer(stream);
		const view = await renderer.createView({scalingMode: "Fit"});
		collection.appendChild(view.target);
}

