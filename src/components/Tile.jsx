import './Tile.css';


const Tile = ({ value, onClick }) => {
  return (
    <div className={`tile ${value === null ? 'empty' : ''}`} onClick={onClick}>
      {value}
    </div>
  );
};

export default Tile;
