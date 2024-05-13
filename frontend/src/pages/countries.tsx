import { useQuery, useMutation, gql } from '@apollo/client';
import Link from 'next/link';
import { useState } from 'react';

const GET_COUNTRIES = gql`
  query GetCountries {
    countries {
      code
      emoji
      id
      name
      continent {
        id
        name
      }
    }
  }
`;

const ADD_COUNTRY = gql`
 mutation AddCountry($data: NewCountryInput!) {
    addCountry(data: $data) {
      code
      name
      emoji
      continent {
        name
      }
    }
  }
`;

const CountriesPage = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [emoji, setEmoji] = useState('');
  const { data, loading, error } = useQuery(GET_COUNTRIES);

  const [addCountry, { error: mutationError }] = useMutation(ADD_COUNTRY, {
    update(cache, { data: { addCountry } }) {
      cache.modify({
        fields: {
          countries(existingCountries = []) {
            const newCountryRef = cache.writeFragment({
              data: addCountry,
              fragment: gql`
                fragment NewCountry on Country {
                  code
                  name
                  emoji
                }
              `,
            });
            return [...existingCountries, newCountryRef];
          },
        },
      });
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error(error);
    return <p>Error: {error.message}</p>;
  }
  if (!data || !data.countries) {
    return <p>No data found</p>;
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (name && code && emoji) {
      try {
       await addCountry({
          variables: {
            data: {
              name,
              code,
              emoji,
            },
          },
        });
        setName('');
        setCode('');
        setEmoji('');
      } catch (err) {
        console.error('Error adding country:', err);
      }
    }
  };

  return (
    <div>
      <h1>Countries</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Name'
        />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder='Code'
        />
        <input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder='Emoji'
        />
        <button type='submit'>Add</button>
      </form>
      <ul>
        {data.countries.map(
          (country: { code: string; name: string; emoji: string }) => (
            <li key={country.code}>
              <Link href={`/country/${country.code}`}>
                {country.name} {country.emoji}
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
};

export default CountriesPage;
