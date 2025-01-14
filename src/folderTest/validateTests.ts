import {FolderTestOptions, FolderTestSchemaWithFilename} from "./types";
import Log from "../logger/Log";

const legalKeys = new Set(["title", "input", "errorExpected", "verbose", "expected", "filename"]);

function validateTest<I, O, E>(content: any, options: FolderTestOptions<I, O, E>): void {
    if (typeof content.title !== "string") {
        throw new Error("required property title is missing or is not a string.");
    }
    if (typeof content.input === "undefined") { // we don't validate input type
        throw new Error("required property input is missing.");
    }
    if (typeof content.errorExpected !== "undefined" && typeof content.errorExpected !== "boolean") {
        throw new Error("optional property errorExpected is not a boolean.");
    }
    if (typeof content.verbose !== "undefined" && typeof content.verbose !== "boolean") {
        throw new Error("optional property verbose is not a boolean.");
    }
    if (options.inputValidator && !options.inputValidator(content.input)) {
        throw new Error("input is not valid.");
    }
    if (typeof content.expected !== "undefined") {
        if (options.outputValidator && !content.errorExpected && !options.outputValidator(content.expected)) {
            throw new Error("output is not valid.");
        }
        if (options.errorValidator && content.errorExpected && !options.errorValidator(content.expected)) {
            throw new Error("error is not valid.");
        }
    }
    if (options.checkForExcessKeys) {
        for (const key in content) {
            if (!legalKeys.has(key)) {
                throw new Error(`extraneous key "${key}" is not valid`);
            }
        }
    }
}

function validateTests<I, O, E>(maybeTests: Array<{ filename: string }>, options: FolderTestOptions<I, O, E>): maybeTests is Array<FolderTestSchemaWithFilename<I, O, E>> {
    let badTests = 0;
    for (const maybeTest of maybeTests) {
        try {
            validateTest(maybeTest, options);
        } catch (err) {
            Log.error(`${maybeTest.filename} does not conform to the test schema. (${err.message})`);
            badTests++;
        }
    }
    if (badTests > 0) {
        const subject = badTests === 1 ? "test" : "tests";
        throw new Error(`${badTests} ${subject} did not conform to the test schema.`);
    }
    return true;
}

export {validateTests};
