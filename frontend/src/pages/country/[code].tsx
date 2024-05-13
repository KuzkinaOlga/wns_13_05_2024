// pages/country/[code].tsx
import { useRouter } from 'next/router';
import { useQuery, gql } from '@apollo/client';

const GET_COUNTRY_DETAILS = gql`
  query GetCountryDetails($code: String!) {
    country(code: $code) {
      name
      code
      emoji
      continent {
        name
      }
    }
  }
`;

const CountryDetails = () => {
  const router = useRouter();
  const { code } = router.query;

  const { data, loading, error } = useQuery(GET_COUNTRY_DETAILS, {
    variables: { code },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const { name, emoji, continent } = data.country;

  return (
    <div>
      <h1>
        {name} {emoji}
      </h1>
      <p>Code: {code}</p>
      {continent && <p>Continent: {continent.name}</p>}
    </div>
  );
};

export default CountryDetails;
