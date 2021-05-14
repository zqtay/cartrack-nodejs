class RandomButton extends React.Component {
  constructor(props) {
    super(props)
    this.getRandom = this.getRandom.bind(this)
  }
  getRandom() {
	fetch('http://localhost:3000/api/random')
	.then(response => response.json())
	.then(data => console.log(data));
  }
  render() {
    return (
		<button type="button" class="btn btn-primary btn-lg px-4 me-sm-3" onClick={this.getRandom}>Randomize</button>
    );
  }
}

ReactDOM.render(<RandomButton />, document.getElementById('button-container'));