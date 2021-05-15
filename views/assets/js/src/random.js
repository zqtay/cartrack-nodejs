class App extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			data:'XXXX', 
			status:`Click 'Randomize' to request for a random 4-digit number!`,
			disabled: false,
			buttonText: 'Randomize',
		};
		this.getRandom = this.getRandom.bind(this);
	}
	getRandom() {
		if (this.state.disabled) {
			return;
		}
		this.setState({disabled:true, buttonText:'Processing...'}); //Prevent multiclicking
		fetch('/api/random')
		.then(response => response.json())
		.then(result => {
			if(result.error || !result.data) this.setState({data:'ERROR'});
			else if (result.data) {
				this.setState({data:result.data.random});
			}
			
			if(result.reqLimit) this.setState({status:reqLimitString(result.reqLimit)});
			
			console.log(result);
			this.setState({disabled:false, buttonText:'Randomize'});
		})
		.catch(error => {
			console.error(error);
			this.setState({status:'Something went wrong.', disabled:false, buttonText:'Randomize'});
		});
		
	}
	
	render() {
		return (
		<div className="App">
		<h1 class="display-5 fw-bold">{this.state.data}</h1>
		<div class="col-lg-6 mx-auto">
		<p class="lead mb-4">{this.state.status}</p>
		<div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
		<button type="button" class="btn btn-primary btn-lg px-4 me-sm-3" onClick={this.getRandom} disabled={this.state.disabled}>{this.state.buttonText}</button>
		</div>
		</div> 	
		</div>
		);
	}
}

function reqLimitString(reqLimit){
	var s = '';
	if(reqLimit.result === true) s += `Request successful!`;
	else if (reqLimit.result === false) s += `Request limit reached!`;
	switch (reqLimit.record.level){
		//User request limit level
		case 1:{
			s += ` Your IP ${reqLimit.ip} is restricted until ${new Date(reqLimit.record.levelEndTime).toLocaleString()}.`;
			break;
		}
		case 2:{
			s += ` Your IP ${reqLimit.ip} is blocked until ${new Date(reqLimit.record.levelEndTime).toLocaleString()}.`;
			break;
		}
		default:
			break;
	}
	return s;
}

ReactDOM.render(<App />, document.getElementById('app-container'));