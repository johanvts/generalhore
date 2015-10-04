// Learn more about F# at http://fsharp.org
// See the 'F# Tutorial' project for more help.

[<EntryPoint>]
let main argv = 
    let raw_file = stdin.ReadToEnd()
    let verses = Sample.getVerses raw_file
    Sample.toJson verses
    0 //success
