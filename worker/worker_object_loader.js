/*
  This js wrapper function loads object files using workers.
  The function maintains state of pending transactions, and needs 
  to be reinitialised for clearing the state.
  The function provides mechanism to query the state, 
  reinitialise, and terminate the worker.
  This function does not block after contacting the server.
  
  Typical invocation below:
   var loader = new WORKER_object_loader()
   loader.init
   loader.post_transaction (this will callback asynchronously)
   loader.is_complete
   loader.destroy / loader.reinitialise

  Binary file formats handled - png, jpg, gif
  Text - tested with Xml, but should work for all
  
  Tested on Firefox 14.x,15.x, Chrome 20.0.1132.57 m and above, on Windows, Linux and Android ICS platforms
  
  Dependencies: XmlHttpRequest, Worker support
*/

WORKER_object_loader = function()
{
	var tworker;
	var outstandingObjectArray=[]; //incoming que
	var assignedObjectArray=[];	 //assigned to worker
	var serverPath;
	var onLoadFunc;

	this.init = initialise;
	this.reinit = reinitialise;
	this.post_transaction = post_transaction;
	this.destroy = destroy;
	this.is_complete = is_complete;
	
	tworker = new Worker('tworker.js');
	tworker.onmessage = function(msg)
	{
		var lastObj = assignedObjectArray.pop();
		showDebugOutput("Received msg from worker "+lastObj.objParam);
		if(lastObj.objType == 0)
		{
			if((msg.data.status == 200) && (msg.data.mime != ""))
			{
				var base64 = window.btoa(msg.data.image);
				var img = new Image();
				img.onload = function() {
					onLoadFunc(img, 
						lastObj.objParam);
				}
				img.src = msg.data.mime + base64;
			}
			else if((msg.data.status == 200) && (msg.data.mime == ""))
			{
					onLoadFunc(msg.data.image, 
						lastObj.objParam);
			}
			else  //there was an error
			{
				showDebugOutput("Error loading object " + lastObj.objParam);
			}
		}//GET
		else
		{
			onLoadFunc(msg.data.image,
				lastObj.objParam);
		}//PUT
		//trigger next
		if(outstandingObjectArray.length > 0)
		{
			var currObj = outstandingObjectArray.pop();
			assignedObjectArray.push(currObj);
			showDebugOutput("Posted msg to worker ");
			tworker.postMessage(
				{'fileName':serverPath+currObj.objFileName,
				'objectParam': 0,
				'isBinary': currObj.objBinary,
				'reqType': currObj.objType,
				'putData': currObj.putData});
		}
	};

	function post_transaction(fileName, objectParam, isBinary, sendType, putData)
	{	
		var newObj = new pendingObj(fileName, objectParam, isBinary, sendType, putData);
		
		outstandingObjectArray.push(newObj);
		if(assignedObjectArray.length == 0)
		{
			assignedObjectArray.push(outstandingObjectArray.pop());
			showDebugOutput("Posted msg to worker ");			
			tworker.postMessage	(
				{'fileName':serverPath+fileName,
				'objectParam': 0, //0th index
				'isBinary': isBinary,
				'reqType': sendType,
				'putData': putData});				
		}
	}

	function initialise(on_load_func, server_path)
	{
		serverPath = server_path;
		onLoadFunc = on_load_func;
	}

	function reinitialise()
	{
		outstandingObjectArray = [];
		assignedObjectArray = [];
	}

	function is_complete()
	{
		if(outstandingObjectArray.length == 0 && assignedObjectArray.length == 0) return true;
		else return false;
	}

	function destroy()
	{
		tworker.terminate();
	}	
	
	function pendingObj(name, param, isbinary, type, putData)
	{
		this.objFileName = name;
		this.objParam = param;
		this.objBinary = isbinary;
		this.objType = type;
		this.putData = putData;
	}	
}; //End of function

