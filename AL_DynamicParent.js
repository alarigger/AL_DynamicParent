/*

switch the active gate of the closest transform gate and bake the coords. 




*/




function AL_Dynamic_parent(){

	/*
	VARIABLES
	*/
	

	var selectedNodes = selection.selectedNodes(0);
	
	

	/*
	EXECUTION

	*/

	if(selectedNodes.length>0){
	
		var snode = get_selected_node();
		
		MessageLog.trace( snode);
		
		var TG = get_parent_TG(snode);
		
		var current_target_gate = get_current_target_gate(TG);
		
		var active_parent = get_connected_peg(TG,current_target_gate);
		
		var remote_parent = get_next_target_peg(TG);
		
		var output_peg = get_output_nodes(TG);
		
		var active_absolute_tranform = get_absolute_transform(active_parent,output_peg);
		var remote_absolute_tranform = get_absolute_transform(remote_parent,output_peg);
		
		var lastX = parseFloat(node.getTextAttr("Top/PROP-P",frame.current(),"POSITION.X"));
		var lastY = parseFloat(node.getTextAttr("Top/PROP-P",frame.current(),"POSITION.Y"));
		var lastA = parseFloat(node.getTextAttr("Top/PROP-P",frame.current(),"ROTATION.ANGLEZ"));
		
		
		var final_X=active_absolute_tranform.x
		var final_Y=active_absolute_tranform.y
		var final_A=remote_absolute_tranform.angle//-lastA

		switch_gate(TG);
		
		
		MessageLog.trace(final_X);
		MessageLog.trace(final_Y);
		
		node.setTextAttr("Top/PROP-P","POSITION.X",frame.current(),final_X);
		node.setTextAttr("Top/PROP-P","POSITION.Y",frame.current(),final_Y);
		//node.setTextAttr("Top/PROP-P","ROTATION.ANGLEZ",frame.current(),final_A);	
			
	}




	/*
	FUNCTIONS

	*/
	function get_selected_node(){
		
		return selectedNodes[0];
		
	}
	
	function get_active_TG_port(tg){
		
		
		
	}
	
	
	function get_parent_TG(n){
		
		// RECURSIVE ! find the first TransformGate in the intput node tree  false if nothing found
		
		var numInput = node.numberOfInputPorts(n);
		
		var first_parent = node.srcNode(n,0);
		
		var parents = [];
		
		MessageLog.trace(first_parent);
		
		parents.push(first_parent);
		
		for (var i = 0 ; i < parents.length ; i ++){
			
			var current_parent = parents[i];
			
			if(node.type(current_parent)=="TransformGate"){
				
				return current_parent;
				
			}else{

				if(hasParentPeg(current_parent)){
					
					numInput = node.numberOfInputPorts(current_parent);
					
					parents.push(node.srcNode(current_parent,0));
					
				}
				
			}
			
		}
		
		
			return false;

	}	
	
	
	
	function get_current_target_gate(tg){
		
		return node.getTextAttr(tg,frame.current(),"TARGET_GATE");
	}
	
	function get_next_gate(gate_number){
		
		return (gate_number-1)*(gate_number-1);	
		
	}
	
	function get_next_target_peg(tg){
		

		var next_gate_number = get_next_gate(get_current_target_gate(tg))
		
		return get_connected_peg(tg,next_gate_number);
		
		
	}
	
	function switch_gate(tg){
		
		var current_gate = get_current_target_gate(tg)
		
		var next_gate = get_next_gate(current_gate);
		
		node.setTextAttr(tg,"TARGET_GATE",frame.current(),next_gate);
		
	}
	
	function hasParentPeg(n){
		
		var numInput = node.numberOfInputPorts(n);
		
		if(numInput > 0){
			
				var source = node.srcNode(n, (numInput-1));
				
				if(source != ""){
					return true;
				}

		}
		
		return false;
			

	}
	
	function get_output_nodes(n){
		
		var node_name_list = Array()
		
		var numOutput = node.numberOfOutputPorts(n);
		
		for(var i = 0; i<numOutput; i++){
			
			
			var nblinks = node.numberOfOutputLinks(n,i);
			
			for(var l = 0; l<nblinks; l++){
			
				node_name_list.push(node.dstNode(n, i, l));
			
			}
			
		}
		
		return node_name_list[0];
		
	}
	
	function get_connected_peg(tg,gate_number){
		
		gp = "";
		
		var node_name_list = Array()
		
		var numInput = node.numberOfInputPorts(tg);
		
		for(var i = 0; i<numInput; i++){
			
			if(i==gate_number){
				gp=node.srcNode(tg, i);
				break;
			}
			
		}

		
		return gp; 
		
	}
	
	
		

	function get_absolute_transform(peg,output_peg){
		
		var parents = get_parent_list(peg);
		
		MessageLog.trace( parents);
		
		var absoluteX = 0;
		var absoluteY = 0;
		
		var X = 0;
		var Y = 0;
		var A = 0;
		var PX = 0;
		var PY = 0;
		
		parents.push(output_peg);
		

		for (var i = 0 ; i < parents.length ; i ++){
			
			
			var current_parent = parents[i];
			
			
			
			if(i > 0){
				
				previous_parent =  parents[i-1];
				
				A +=  parseFloat(node.getTextAttr(previous_parent,frame.current(),"ROTATION.ANGLEZ"));
				
				PX = parseFloat(node.getTextAttr(previous_parent,frame.current(),"PIVOT.X"));
				PY = parseFloat(node.getTextAttr(previous_parent,frame.current(),"PIVOT.Y"));
			
				X = parseFloat(node.getTextAttr(current_parent,frame.current(),"POSITION.X"));
				Y = parseFloat(node.getTextAttr(current_parent,frame.current(),"POSITION.Y"));		
				
				
				
				MessageLog.trace( "x "+X +" y "+Y +" angle "+A +" ");
				
				//subtraction pivot
				var DX = X-PX;
				var DY = Y-PY;
				
				
				
				var RA =A*(Math.PI / 180);
				
				absoluteX += ((Math.cos(RA)*DX) - (Math.sin(RA)*DY))+PX ;
				absoluteY += (((Math.sin(RA)*DX) + (Math.cos(RA)*DY))+PY);
				
				
			}else{
				
				absoluteX = parseFloat(node.getTextAttr(current_parent,frame.current(),"POSITION.X"));
				absoluteY = parseFloat(node.getTextAttr(current_parent,frame.current(),"POSITION.Y"));					
				
			}
			
			
		}
		
		var baked_point = {x:absoluteX,y:absoluteY*(4/3),angle:A};
		
		return baked_point ;
		
		
	}
	

	
	function get_parent_list(n){
		
		// RECURSIVE ! find the first TransformGate in the intput node tree  false if nothing found
		
		var parents = [];
		
		parents.push(n);
		
		for (var i = 0 ; i < parents.length ; i ++){
			
			var current_parent = parents[i];
			
			if(node.type(current_parent)=="PEG"){

				if(hasParentPeg(current_parent)){
					
					numInput = node.numberOfInputPorts(current_parent);
					
					parents.push(node.srcNode(current_parent,0));
					
				}
				
				
			}
			
		}
		
		//form first to last
		
		
		
		return parents.reverse();		
		
	}
	
	function get_parent_Peg(n){
		
		if(hasParentPeg(n)){
			
			var numInput = node.numberOfInputPorts(n);
			
			var  current_parent = node.srcNode(n,0);
			
			if(node.type(current_parent)=="PEG"){
				
				return current_parent;
				
			}
			
		}
		
		return false;
		

	}	
	


}
