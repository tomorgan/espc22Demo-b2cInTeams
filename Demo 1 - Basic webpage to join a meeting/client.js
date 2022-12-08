import { CallClient, CallAgent } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

const connectButton = document.getElementById('connect-button');
const disconnectButton = document.getElementById('disconnect-button');
const callStateElement = document.getElementById('call-state');
const destinationGroupElement = document.getElementById('destination-group-input');

let call;
let callAgent;
let callClient;

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
}

init();

connectButton.addEventListener("click", () => {        	

	//3. Join a Call
    const destinationToCall = { meetingLink: destinationGroupElement.value};
	call = callAgent.join(destinationToCall);	
	
	
    //4. Subscribe to events
    call.on('stateChanged', () => {
        callStateElement.innerText = call.state;
    })
	
    //Other: toggle button states
    disconnectButton.disabled = false;
    connectButton.disabled = true;
});

disconnectButton.addEventListener("click", async () => {
    await call.hangUp();
  
    //Other: toggle button states
    disconnectButton.disabled = true;
    connectButton.disabled = false;
    callStateElement.innerText = '-';
  });

