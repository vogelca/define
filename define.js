// Parse the command-line arguments.
let word;
let includeOrigin = false;
let includeExamples = false;
let includePhonetics = false;
for (const arg of process.argv.slice(2)) {
    if (arg.length > 2 && arg[0] == '-' && arg[1] == '-' && arg[2] != '-') {
        if (arg == '--help') {
            help();
        } else if (arg == '--origin') {
            includeOrigin = true;
        } else if (arg == '--phonetics') {
            includePhonetics = true;
        } else if (arg == '--examples') {
            includeExamples = true;
        } else if (arg == '--verbose') {
            includeOrigin = true;
            includePhonetics = true;
            includeExamples = true;
        }
    } else if (arg.length > 1 && arg[0] == '-' && arg[1] != '-') {
        for (let i = 1; i < arg.length; i++) {
            if (arg[i] == 'h') {
                help();
            } else if (arg[i] == 'o') {
                includeOrigin = true;
            } else if (arg[i] == 'p') {
                includePhonetics = true;
            } else if (arg[i] == 'e') {
                includeExamples = true;
            } else if (arg[i] == 'v') {
                includeOrigin = true;
                includePhonetics = true;
                includeExamples = true;
            }
        }
    } else {
        word = arg;
    }
}
if (word === undefined) {
    console.error('\033[1;31mERROR:\033[0m missing word');
    console.error('Type "\033[3mdefine --help\033[0m" for instructions');
    process.exit(1);
}

// Fetch the definition object from the API.
const https = require('https');
https.get('https://api.dictionaryapi.dev/api/v2/entries/en/' + word, (res) => {
    let data = '';
    res.on('data', (d) => {
        data += d;
    });
    res.on('error', (e) => {
        console.error('\033[1;31mERROR:\033[0m %s', e);
        process.exit(1);
    });
    res.on('end', () => {
        if (res.statusCode != 200) {
            console.error('\033[1;31mERROR:\033[0m word not found');
            process.exit(1);
        }
        print(JSON.parse(data)[0]);
    });
});

// Print the definition to the screen.
function print(object) {
    if (includeOrigin && 'origin' in object) {
        console.log('\033[1;33mORIGIN:\033[0m');
        console.log(object.origin);
    }
    if (includePhonetics && 'phonetics' in object) {
        console.log('\033[1;33mPHONETICS:\033[0m');
        for (const phonetic of object.phonetics) {
            console.log('• %s', phonetic.text);
        }
    }
    for (const meaning of object.meanings) {
        console.log('\033[1;33m%s:\033[0m', meaning.partOfSpeech.toUpperCase());
        let examples = [];
        for (const def of meaning.definitions) {
            console.log('• %s', def.definition);
            if ('example' in def) {
                examples.push(def.example);
            }
        }
        if (includeExamples) {
            for (const ex of examples) {
                console.log('"\033[3m%s\033[0m"', ex);
            }
        }
    }
}

// Print the help message and terminate the program.
function help() {
    console.log('\033[1;33mUSAGE:\033[0m');
    console.log('define [OPTIONS] \033[1;92mWORD\033[0m');
    console.log('\033[1;33mOPTIONS:\033[0m');
    console.log('\033[3m-h, --help\033[0m: display help message');
    console.log('\033[3m-o, --origin\033[0m: include origin in definition');
    console.log('\033[3m-p, --phonetics\033[0m: include phonetics in definition');
    console.log('\033[3m-e, --examples\033[0m: include examples in definition');
    console.log('\033[3m-v, --verbose\033[0m: include all information in definition');
    process.exit(0);
}
