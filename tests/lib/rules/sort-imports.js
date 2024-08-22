const rule = require('../../../lib/rules/sort-imports');
const plugin = require('../../../lib/plugin');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
    plugins: {
        'scrumble-rules': plugin,
    },
});

ruleTester.run('sort-imports', rule, {
    valid: [
        {
            code: `import React from 'react';

import axios from 'axios';
import {useTranslate} from 'react-polyglot';
import Button from 'react-bootstrap/cjs/Button';
import {Modal, ModalProps} from '@scrumble-nl/react-quick-modal';
import {IToast, withToaster} from '@scrumble-nl/react-quick-toaster';

import {redirectTo} from '../../base/routing/partials/routing-util';

import './scss/information-table.scss';
            `,
        },
        {
            code: `import React from "react";

import A from "A";
import ALong from "ALong";
        `,
        },
        {
            code: `import React from 'react';

import "./long-text.scss"
import "./test.scss"`,
        },
        {
            code: `import {
    ThisIsAveryLongVariableName,
    AnotherLongVariableName,
    YetAnotherLongVariableName,
    MoreLongVariableNames,
} from "test";

import A from "./test";`,
        },
    ],

    invalid: [
        {
            errors: [{messageId: 'sort'}],
            output: `import React from 'react';
import Idk, {Something, Else} from "react-native";

import axios from 'axios';
import {useTranslate} from 'react-polyglot';
import Button from 'react-bootstrap/cjs/Button';
import {Modal, ModalProps} from '@scrumble-nl/react-quick-modal';
import {IToast, withToaster} from '@scrumble-nl/react-quick-toaster';

import {redirectTo} from '../../base/routing/partials/routing-util';

import Test from './scss/information-table.scss';`,
            code: `import Test from './scss/information-table.scss';
import axios from 'axios';

import Idk, {Something, Else} from "react-native";
import {Modal, ModalProps} from '@scrumble-nl/react-quick-modal';
import Button from 'react-bootstrap/cjs/Button';
import React from 'react';

import {useTranslate} from 'react-polyglot';
import {IToast, withToaster} from '@scrumble-nl/react-quick-toaster';
import {redirectTo} from '../../base/routing/partials/routing-util';`,
        },
        {
            errors: [{messageId: 'sort'}],
            output: `import A from "test";
import {Test as Different} from "test";`,
            code: `import {Test as Different} from "test";
import A from "test";`,
        },
    ],
});
