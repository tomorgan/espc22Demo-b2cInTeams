import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import {
  CallAdapter,
  createAzureCommunicationCallAdapter,
  CallComposite  
} from '@azure/communication-react';
import React, { useEffect, useState } from 'react';

function App(): JSX.Element {
	
  const displayName = 'ACS Composite Call User';  
  const teamsMeetingUrl = 'ADD TEAMS JOIN URL HERE';
  const [callAdapter, setCallAdapter] = useState<CallAdapter>();
  
  useEffect(() => {
	  async function getTokenAndCredentialsForAdapter() {
    
	      const response = await fetch('[URL TO YOUR FUNCTION APP]');
		  const responseJson = await response.json(); 
		  const token = responseJson.value.accessToken.token;
		  const userId = responseJson.value.usery.id;
	      const credential = new AzureCommunicationTokenCredential(token);
		
        setCallAdapter(
          await createAzureCommunicationCallAdapter({
            userId: { kind: 'communicationUser', communicationUserId: userId },
            displayName,
            credential,
            locator: { meetingLink: teamsMeetingUrl }
          })
        );
      };
	  getTokenAndCredentialsForAdapter();
    
  }, []);

  if (!!callAdapter) {
    return   <CallComposite adapter={callAdapter}  />;
  }
  
  return <h3>Initializing...</h3>;
}

export default App;