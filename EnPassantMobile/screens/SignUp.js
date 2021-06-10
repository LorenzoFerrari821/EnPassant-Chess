import React, {Component} from 'react'
import {TextInput, Button, Card, Portal, Dialog, Paragraph, Provider} from 'react-native-paper'
import {StatusBar} from 'expo-status-bar'
import {Picker} from '@react-native-picker/picker';
import {Image, View, Platform} from 'react-native';
import * as ImagePicker from 'expo-image-picker';


class SignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: {text: "", error: false},
            password1: {text: "", error: false},
            password2: {text: "", error: false},
            email: {text: "", error: false},
            firstName: {text: "", error: false},
            lastName: {text: "", error: false},
            country: "AF",
            image: "",
            error: "",
            showDialog: false,
        }
    }


    askPermission = async () => {
        if (Platform.OS !== 'web') {
            const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need permissions to make this work!')
                return 0
            }
        }
        return 1
    }


    pickImage = async () => {
        if (!await this.askPermission())
            return

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        })

        if (!result.cancelled) {
            this.setState({image: result.uri})
        }
    }


    checkFormFilled = () => {
        let state
        if (this.state.username.text === "")
            state = {...state, username: {text: "", error: true}}
        if (this.state.password1.text === "")
            state = {...state, password1: {text: "", error: true}}
        if (this.state.password2.text === "")
            state = {...state, password2: {text: "", error: true}}
        if (this.state.email.text === "")
            state = {...state, email: {text: "", error: true}}
        if (this.state.password1.text !== this.state.password2.text)
            state = {
                ...state,
                password1: {text: this.state.password1.text, error: true},
                password2: {text: this.state.password2.text, error: true}
            }
        if (state) {
            this.setState(state)
            return 0
        } else return 1
    }


    signUp = () => {
        if (this.checkFormFilled()) {
            fetch('http://127.0.0.1:8000/mobile/users/signup/', {
                method: "POST",
                headers: {
                    Accept: 'application/json', 'content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: this.state.username.text,
                    password: this.state.password1.text,
                    email: this.state.email.text,
                    country: this.state.country,
                    first_name: this.state.firstName.text,
                    last_name: this.state.lastName.text,
                    picture: this.state.image
                })
            })
                .then((response) => {
                    if (response.status === 201)
                        this.setState({showDialog: true})
                    return response.json()
                })
                .then((responseJson) => {
                    let errors = ""
                    for (const [key, value] of Object.entries(responseJson)) {
                        errors = errors.concat(" -> " + key + ": " + value + "\n")
                    }
                    if (!!errors) {
                        const state = {
                            error: "Something went wrong. The server returned the following error:\n" + errors
                        }
                        this.setState(state)
                    }
                })
        }
    }


    changeUsername = (text) => {
        const state = {
            username: {text: text, error: false}
        }
        this.setState(state)
    }

    changePassword1 = (text) => {
        const state = {
            password1: {text: text, error: false}
        }
        this.setState(state)
    }
    changePassword2 = (text) => {
        const state = {
            password2: {text: text, error: false}
        }
        this.setState(state)
    }

    changeEmail = (text) => {
        const state = {
            email: {text: text, error: false}
        }
        this.setState(state)
    }
    changeFirstName = (text) => {
        const state = {
            firstName: {text: text, error: false}
        }
        this.setState(state)
    }

    changeLastName = (text) => {
        const state = {
            lastName: {text: text, error: false}
        }
        this.setState(state)
    }


    render() {

        return (
            <Provider>
                <View style={{
                    flex: 1,
                    backgroundColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <StatusBar style="auto"/>

                    <Portal>
                        <Dialog visible={this.state.showDialog}
                                onDismiss={() => {
                                    this.props.navigation.navigate("Login")
                                }}>
                            <Dialog.Title>Activation Required</Dialog.Title>
                            <Dialog.Content>
                                <Paragraph>
                                    You need to activate your account in order to do your first login. We have emailed
                                    you istructions on how to activate your account at the email you just entered.
                                </Paragraph>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button onPress={() => {
                                    this.props.navigation.navigate("LogIn")
                                }}>Back to login</Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>

                    <Card>
                        <Card.Title title="Sign Up" subtitle="Create an account to start playing"/>
                        <Card.Content>
                            <Paragraph style={{color: "red", fontWeight: "bold"}}>{this.state.error}</Paragraph>
                        </Card.Content>
                        <Card.Content>
                            <TextInput mode='outlined' label="Username" value={this.state.username.text}
                                       onChangeText={this.changeUsername}
                                       error={this.state.username.error}/>
                            <TextInput mode='outlined' label="Password" value={this.state.password1.text}
                                       onChangeText={this.changePassword1}
                                       error={this.state.password1.error}/>
                            <TextInput mode='outlined' label="Confirm Password" value={this.state.password2.text}
                                       onChangeText={this.changePassword2}
                                       error={this.state.password2.error}/>
                            <TextInput mode='outlined' label="Email" value={this.state.email.text}
                                       onChangeText={this.changeEmail}
                                       error={this.state.email.error}/>
                            <Paragraph style={{fontWeight: "bold"}}>Select your country:</Paragraph>
                            <Picker
                                selectedValue={this.state.country}
                                onValueChange={(itemValue) => {
                                    this.setState({country: itemValue})
                                }}>
                                {Object.keys(countriesList).map(function (key) {
                                    return <Picker.Item label={countriesList[key]} value={key}/>
                                })}
                            </Picker>
                            <TextInput mode='outlined' label="First Name (Optional)"
                                       value={this.state.firstName.text}
                                       onChangeText={this.changeFirstName}
                                       error={this.state.firstName.error}/>
                            <TextInput mode='outlined' label="Last Name (Optional)"
                                       value={this.state.lastName.text}
                                       onChangeText={this.changeLastName}
                                       error={this.state.lastName.error}/>

                            <Paragraph style={{fontWeight: "bold"}}>Choose a profile picture (optional):</Paragraph>
                            <Button mode={"outlined"} onPress={this.pickImage}>Pick an image</Button>
                            {!!this.state.image &&
                            <Image source={{uri: this.state.image}} style={{
                                maxWidth: 200, height: 200, display: "block", marginLeft: "auto",
                                marginRight: "auto", width: "100%"
                            }}/>
                            }
                        </Card.Content>
                        <Card.Actions>
                            <Button mode={"contained"} color={"red"} onPress={this.signUp}>Sign up</Button>
                            <Button mode={"contained"} style={{marginLeft: "5px"}} onPress={() => {
                                this.props.navigation.goBack()
                            }}>
                                Return to login
                            </Button>
                        </Card.Actions>
                    </Card>
                </View>
            </Provider>
        )
    }
}


export default SignUp


const countriesList =
    {
        'AF':
            'Afghanistan',
        'AX':
            'Åland Islands',
        'AL':
            'Albania',
        'DZ':
            'Algeria',
        'AS':
            'American Samoa',
        'AD':
            'Andorra',
        'AO':
            'Angola',
        'AI':
            'Anguilla',
        'AQ':
            'Antarctica',
        'AG':
            'Antigua and Barbuda',
        'AR':
            'Argentina',
        'AM':
            'Armenia',
        'AW':
            'Aruba',
        'AU':
            'Australia',
        'AT':
            'Austria',
        'AZ':
            'Azerbaijan',
        'BS':
            'Bahamas',
        'BH':
            'Bahrain',
        'BD':
            'Bangladesh',
        'BB':
            'Barbados',
        'BY':
            'Belarus',
        'BE':
            'Belgium',
        'BZ':
            'Belize',
        'BJ':
            'Benin',
        'BM':
            'Bermuda',
        'BT':
            'Bhutan',
        'BO':
            'Bolivia',
        'BQ':
            'Bonaire, Sint Eustatius and Saba',
        'BA':
            'Bosnia and Herzegovina',
        'BW':
            'Botswana',
        'BV':
            'Bouvet Island',
        'BR':
            'Brazil',
        'IO':
            'British Indian Ocean Territory',
        'BN':
            'Brunei',
        'BG':
            'Bulgaria',
        'BF':
            'Burkina Faso',
        'BI':
            'Burundi',
        'CV':
            'Cabo Verde',
        'KH':
            'Cambodia',
        'CM':
            'Cameroon',
        'CA':
            'Canada',
        'KY':
            'Cayman Islands',
        'CF':
            'Central African Republic',
        'TD':
            'Chad',
        'CL':
            'Chile',
        'CN':
            'China',
        'CX':
            'Christmas Island',
        'CC':
            'Cocos (Keeling) Islands',
        'CO':
            'Colombia',
        'KM':
            'Comoros',
        'CG':
            'Congo',
        'CD':
            'Congo (the Democratic Republic of the)',
        'CK':
            'Cook Islands',
        'CR':
            'Costa Rica',
        'CI':
            "Côte d'Ivoire",
        'HR':
            'Croatia',
        'CU':
            'Cuba',
        'CW':
            'Curaçao',
        'CY':
            'Cyprus',
        'CZ':
            'Czechia',
        'DK':
            'Denmark',
        'DJ':
            'Djibouti',
        'DM':
            'Dominica',
        'DO':
            'Dominican Republic',
        'EC':
            'Ecuador',
        'EG':
            'Egypt',
        'SV':
            'El Salvador',
        'GQ':
            'Equatorial Guinea',
        'ER':
            'Eritrea',
        'EE':
            'Estonia',
        'SZ':
            'Eswatini',
        'ET':
            'Ethiopia',
        'FK':
            'Falkland Islands (Malvinas)',
        'FO':
            'Faroe Islands',
        'FJ':
            'Fiji',
        'FI':
            'Finland',
        'FR':
            'France',
        'GF':
            'French Guiana',
        'PF':
            'French Polynesia',
        'TF':
            'French Southern Territories',
        'GA':
            'Gabon',
        'GM':
            'Gambia',
        'GE':
            'Georgia',
        'DE':
            'Germany',
        'GH':
            'Ghana',
        'GI':
            'Gibraltar',
        'GR':
            'Greece',
        'GL':
            'Greenland',
        'GD':
            'Grenada',
        'GP':
            'Guadeloupe',
        'GU':
            'Guam',
        'GT':
            'Guatemala',
        'GG':
            'Guernsey',
        'GN':
            'Guinea',
        'GW':
            'Guinea-Bissau',
        'GY':
            'Guyana',
        'HT':
            'Haiti',
        'HM':
            'Heard Island and McDonald Islands',
        'VA':
            'Holy See',
        'HN':
            'Honduras',
        'HK':
            'Hong Kong',
        'HU':
            'Hungary',
        'IS':
            'Iceland',
        'IN':
            'India',
        'ID':
            'Indonesia',
        'IR':
            'Iran',
        'IQ':
            'Iraq',
        'IE':
            'Ireland',
        'IM':
            'Isle of Man',
        'IL':
            'Israel',
        'IT':
            'Italy',
        'JM':
            'Jamaica',
        'JP':
            'Japan',
        'JE':
            'Jersey',
        'JO':
            'Jordan',
        'KZ':
            'Kazakhstan',
        'KE':
            'Kenya',
        'KI':
            'Kiribati',
        'KP':
            'North Korea',
        'KR':
            'South Korea',
        'KW':
            'Kuwait',
        'KG':
            'Kyrgyzstan',
        'LA':
            'Laos',
        'LV':
            'Latvia',
        'LB':
            'Lebanon',
        'LS':
            'Lesotho',
        'LR':
            'Liberia',
        'LY':
            'Libya',
        'LI':
            'Liechtenstein',
        'LT':
            'Lithuania',
        'LU':
            'Luxembourg',
        'MO':
            'Macao',
        'MG':
            'Madagascar',
        'MW':
            'Malawi',
        'MY':
            'Malaysia',
        'MV':
            'Maldives',
        'ML':
            'Mali',
        'MT':
            'Malta',
        'MH':
            'Marshall Islands',
        'MQ':
            'Martinique',
        'MR':
            'Mauritania',
        'MU':
            'Mauritius',
        'YT':
            'Mayotte',
        'MX':
            'Mexico',
        'FM':
            'Micronesia (Federated States of)',
        'MD':
            'Moldova',
        'MC':
            'Monaco',
        'MN':
            'Mongolia',
        'ME':
            'Montenegro',
        'MS':
            'Montserrat',
        'MA':
            'Morocco',
        'MZ':
            'Mozambique',
        'MM':
            'Myanmar',
        'NA':
            'Namibia',
        'NR':
            'Nauru',
        'NP':
            'Nepal',
        'NL':
            'Netherlands',
        'NC':
            'New Caledonia',
        'NZ':
            'New Zealand',
        'NI':
            'Nicaragua',
        'NE':
            'Niger',
        'NG':
            'Nigeria',
        'NU':
            'Niue',
        'NF':
            'Norfolk Island',
        'MK':
            'North Macedonia',
        'MP':
            'Northern Mariana Islands',
        'NO':
            'Norway',
        'OM':
            'Oman',
        'PK':
            'Pakistan',
        'PW':
            'Palau',
        'PS':
            'Palestine, State of',
        'PA':
            'Panama',
        'PG':
            'Papua New Guinea',
        'PY':
            'Paraguay',
        'PE':
            'Peru',
        'PH':
            'Philippines',
        'PN':
            'Pitcairn',
        'PL':
            'Poland',
        'PT':
            'Portugal',
        'PR':
            'Puerto Rico',
        'QA':
            'Qatar',
        'RE':
            'Réunion',
        'RO':
            'Romania',
        'RU':
            'Russia',
        'RW':
            'Rwanda',
        'BL':
            'Saint Barthélemy',
        'SH':
            'Saint Helena, Ascension and Tristan da Cunha',
        'KN':
            'Saint Kitts and Nevis',
        'LC':
            'Saint Lucia',
        'MF':
            'Saint Martin (French part)',
        'PM':
            'Saint Pierre and Miquelon',
        'VC':
            'Saint Vincent and the Grenadines',
        'WS':
            'Samoa',
        'SM':
            'San Marino',
        'ST':
            'Sao Tome and Principe',
        'SA':
            'Saudi Arabia',
        'SN':
            'Senegal',
        'RS':
            'Serbia',
        'SC':
            'Seychelles',
        'SL':
            'Sierra Leone',
        'SG':
            'Singapore',
        'SX':
            'Sint Maarten (Dutch part)',
        'SK':
            'Slovakia',
        'SI':
            'Slovenia',
        'SB':
            'Solomon Islands',
        'SO':
            'Somalia',
        'ZA':
            'South Africa',
        'GS':
            'South Georgia and the South Sandwich Islands',
        'SS':
            'South Sudan',
        'ES':
            'Spain',
        'LK':
            'Sri Lanka',
        'SD':
            'Sudan',
        'SR':
            'Suriname',
        'SJ':
            'Svalbard and Jan Mayen',
        'SE':
            'Sweden',
        'CH':
            'Switzerland',
        'SY':
            'Syria',
        'TW':
            'Taiwan',
        'TJ':
            'Tajikistan',
        'TZ':
            'Tanzania',
        'TH':
            'Thailand',
        'TL':
            'Timor-Leste',
        'TG':
            'Togo',
        'TK':
            'Tokelau',
        'TO':
            'Tonga',
        'TT':
            'Trinidad and Tobago',
        'TN':
            'Tunisia',
        'TR':
            'Turkey',
        'TM':
            'Turkmenistan',
        'TC':
            'Turks and Caicos Islands',
        'TV':
            'Tuvalu',
        'UG':
            'Uganda',
        'UA':
            'Ukraine',
        'AE':
            'United Arab Emirates',
        'GB':
            'United Kingdom',
        'UM':
            'United States Minor Outlying Islands',
        'US':
            'United States of America',
        'UY':
            'Uruguay',
        'UZ':
            'Uzbekistan',
        'VU':
            'Vanuatu',
        'VE':
            'Venezuela',
        'VN':
            'Vietnam',
        'VG':
            'Virgin Islands (British)',
        'VI':
            'Virgin Islands (U.S.)',
        'WF':
            'Wallis and Futuna',
        'EH':
            'Western Sahara',
        'YE':
            'Yemen',
        'ZM':
            'Zambia',
        'ZW':
            'Zimbabwe'
    }