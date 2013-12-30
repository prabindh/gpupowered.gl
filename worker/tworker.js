/* Simple worker to load object via http and respond with mime+bytearray

  Typical invocation below:
   tworker.postMessage(
	{'fileName':server_path, - Full path to file
	'objectParam':someParam}); - This is unused, will be returned as-is. This
   avoids caller keeping track of associated data of object
  
   Refer to worker_object_loader.js for usage

   POST data has to be URI encoded before using this function
   
   base64 idea is taken from the below discussion thread, with modifications
   for asynchronous calls
   http://stackoverflow.com/questions/8022425/getting-blob-data-from-xhr-request
*/

self.onmessage = function(object) 
{
	var request;
	if(object.data.reqType == 1)
	{
		request = new XMLHttpRequest();	
		request.open('POST', object.data.fileName, true);
		request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		encData = object.data.putData;
		request.setRequestHeader("Content-length", encData.length);
		request.send(encData);
	}
	else
	{
		request = new XMLHttpRequest();
		request.open('GET', object.data.fileName, true);
		if(object.data.isBinary == 1) request.responseType = 'arraybuffer';	
		request.send();	
	}	
	//request.onreadystatechange = function()
	request.onload = function()
	{
		if(object.data.reqType == 1)
			handle_put_response();
		else
			handle_get_response();		

	}// statechange	
	
	
	function handle_get_response()
	{
		if (request.readyState == 4 && request.status == 200 && 
				object.data.isBinary == 1)
		{
			var imageArray = new Uint8Array(request.response);
			var imageArraylen = imageArray.length;
			var binaryString = new Array(imageArraylen);
			while (imageArraylen > 0)
			{
				imageArraylen --;
				binaryString[imageArraylen] = 
					String.fromCharCode(imageArray[imageArraylen]);
			}
			var data = binaryString.join('');
			var mime;
			if((object.data.fileName.indexOf(".png") != -1) || 
				(object.data.fileName.indexOf(".PNG") != -1))
			{
				mime = "data:image/png;base64,";
			}
			else if((object.data.fileName.indexOf(".jpg") != -1) || 
				(object.data.fileName.indexOf(".JPG") != -1))
			{
				mime = "data:image/jpeg;base64,";
			}
			else if((object.data.fileName.indexOf(".gif") != -1) || 
				(object.data.fileName.indexOf(".GIF") != -1))
			{
				mime = "data:image/gif;base64,";
			}
			//Add other mime types here + Magic check

			self.postMessage({'image':data, 'status':200, 
				'objectParam':object.data.objectParam, 'mime':mime});
		}	
		else if (request.readyState == 4 && request.status == 200 && 
			object.data.isBinary == 0)
		{
			self.postMessage({'image':request.responseText, 'status':200, 
				'objectParam':object.data.objectParam, 'mime':""});	
		}
		else //error case
		{
			self.postMessage(
				{'image':new ArrayBuffer(0), 
				'status':request.status,  
				'objectParam':object.data.objectParam, 
				'mime':""});
		}	
	} //handle GET obj

	function handle_put_response()
	{
		if (request.readyState == 4 && request.status == 200 && 
			object.data.isBinary == 0)
		{
			self.postMessage({'image':request.responseText, 'status':200, 
				'objectParam':object.data.objectParam, 'mime':""});			
		}
		else //error case
		{
			self.postMessage(
				{'image':new ArrayBuffer(0), 
				'status':request.status, 
				'objectParam':object.data.objectParam, 
				'mime':""});
		}	
	}//PUT response
}; //End of function


