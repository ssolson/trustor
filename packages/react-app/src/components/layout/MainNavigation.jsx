import {Link} from 'react-router-dom'

export default function MainNaviagation () {
  return (
  <header>
    <div>Trustor Trusts </div>
    <nav>
      <ul>
        <li>
          <Link to='/'> All Trusts</Link>
        </li>
        <li>
          <Link to='/new-trust'> Add New Trusts</Link>
        </li>
        <li>
          <Link to='/favorites'> Favorite Trust</Link>
        </li>
      </ul>
    </nav>
  </header>
  )
}
