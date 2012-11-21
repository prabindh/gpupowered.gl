/******************************************************************
  setup_simple.js
    Part of gpupowered.org WebGL tutorial framework
    For example, http://www.gpupowered.org/sand/launch2/
  Usage:
    Refer myloader() function. Uses objdata.js
  Status:
    Works for most .obj files. Material names only provided,
    data is to be obtained separately. There are optimisations
    from memory and performance perspective possible just by
    casual observation but not implemented to keep clarity
  Notes:
    .obj is widely used, but it is not good  for complex scenes.
    The example .obj string arrays below show why - from bandwidth
    and string processing and standardisation perspective.
    It is recommended to transmit converted json at server end.
    With compressed representations coming up, the need for .obj
    parsers/loaders should slowly(!) go away
  Author:
    prabindh@gpupowered.org,
    http://www.gpupowered.org/
*******************************************************************/


function myloader(parsedBlobName)
{
	var parsedBlobVal = parseOBJfile(parsedBlobName);

	//parsedBlobVal is an array, 
	//Each array provides info about 1 object in the .obj file
	//parsedBlobVal[i].mtl will provide material name
	for(var i = 0; i < parsedBlobVal.length; i ++)
	{
		vertexArray = new Float32Array(parsedBlobVal[i].vertices);
		indexArray = new Uint16Array(parsedBlobVal[i].indices);
		texCoordArray = new Float32Array(parsedBlobVal[i].finaluv);
	}
}
